import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models import Base, Failure, Diagnosis
from backend.agents.diagnosis import DiagnosisAgent
from backend.integrations.claude_client import ClaudeClient

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()

def test_diagnosis_rule_fallback_network():
    client = ClaudeClient()
    res = client._rule_based_fallback(
        amount=14000.0,
        reason="network_timeout",
        customer_email="test@user.com",
        success_rate=88.0,
        merchant_name="QuickKart",
        chargeback_rate=0.2,
        reason_description="Bank switch unreachable"
    )
    assert res["cause_category"] == "network"
    assert res["recommended_action"] == "retry"
    assert res["recovery_probability"] >= 65
    assert res["confidence"] >= 80

def test_diagnosis_rule_fallback_issuer_low_amount():
    client = ClaudeClient()
    res = client._rule_based_fallback(
        amount=2499.0,
        reason="issuer_declined",
        customer_email="test@user.com",
        success_rate=75.0,
        merchant_name="QuickKart",
        chargeback_rate=0.2
    )
    assert res["cause_category"] == "issuer"
    assert res["recommended_action"] == "contact_customer"
    assert res["severity"] == "medium"

def test_diagnosis_agent_integration(test_db):
    failure = Failure(
        tx_id="tx_test_diag_1",
        merchant_id="mer_test",
        amount=3500.0,
        reason="otp_expired",
        failure_category="issuer",
        customer_email="priya@test.com",
        customer_history={"success_rate": 82.0, "trust_score": 80},
        merchant_metrics={"name": "TestStore", "chargeback_rate": 0.2}
    )
    test_db.add(failure)
    test_db.commit()

    agent = DiagnosisAgent()
    diag = agent.diagnose(test_db, "tx_test_diag_1")

    assert diag["failure_id"] == "tx_test_diag_1"
    assert diag["cause_category"] == "issuer"
    assert diag["recommended_action"] == "contact_customer"
    assert diag["confidence"] >= 60

    # Ensure persisted in DB
    db_diag = test_db.query(Diagnosis).filter(Diagnosis.failure_id == "tx_test_diag_1").first()
    assert db_diag is not None
