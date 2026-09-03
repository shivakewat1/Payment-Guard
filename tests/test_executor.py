import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models import Base, Failure, Intervention, AuditLog
from backend.agents.executor import RecoveryExecutor

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()

def test_executor_graceful_failure_demonstration(test_db):
    """
    Tests the exact example from the brief:
    Retry 1: Failed (network timeout) -> Logged & waited
    Retry 2: Failed (network timeout) -> Logged & waited
    Retry 3: Success! -> Logged -> Money recovered: ₹5000
    """
    executor = RecoveryExecutor()

    # Create failure record for tx_1001
    tx = Failure(
        tx_id="tx_1001",
        merchant_id="mer_quickkart_01",
        amount=5000.0,
        currency="INR",
        reason="network_timeout",
        failure_category="network",
        status="detected"
    )
    interv = Intervention(
        intervention_id="iv_test_graceful",
        failure_id="tx_1001",
        action="AUTO_RETRY",
        parameters={"retry_count": 3, "retry_delay": [5, 15, 60]},
        risk_level="low",
        status="pending"
    )
    test_db.add_all([tx, interv])
    test_db.commit()

    exec_result = executor.execute_intervention(test_db, "iv_test_graceful")

    assert exec_result["status"] == "success"
    assert exec_result["money_recovered"] == 5000.0
    assert exec_result["duration_seconds"] >= 0.1

    # Verify audit log steps
    audit = test_db.query(AuditLog).filter(AuditLog.execution_id == exec_result["execution_id"]).first()
    assert audit is not None
    assert audit.status == "success"
    assert audit.money_recovered == 5000.0

    steps = audit.steps
    assert len(steps) >= 4
    # Check that retry steps are recorded
    step_actions = [s["action"] for s in steps]
    assert any("Attempt 1" in a for a in step_actions)
    assert any("Attempt 2" in a for a in step_actions)
    assert any("Attempt 3" in a for a in step_actions)

    # Check that handled exceptions were logged in audit log
    assert audit.exceptions is not None
    assert audit.exceptions["exception_type"] == "NetworkTimeout"

    # Verify failure record updated in DB
    updated_tx = test_db.query(Failure).filter(Failure.tx_id == "tx_1001").first()
    assert updated_tx.status == "recovered"
