import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models import Base, Failure, Diagnosis, Intervention
from backend.agents.intervention import InterventionEngine

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()

def test_rule_1_network_auto_retry(test_db):
    engine_inst = InterventionEngine()
    engine_inst.reset_circuit()

    tx = Failure(
        tx_id="tx_net_1",
        merchant_id="mer_1",
        amount=8500.0,
        reason="network_timeout",
        failure_category="network",
        customer_history={"trust_score": 65}
    )
    diag = Diagnosis(
        failure_id="tx_net_1",
        root_cause="network_timeout",
        cause_category="network",
        severity="low",
        recovery_probability=80,
        confidence=85,
        recommended_action="retry"
    )
    test_db.add_all([tx, diag])
    test_db.commit()

    decision = engine_inst.decide_intervention(test_db, "tx_net_1")
    assert decision["action"] == "AUTO_RETRY"
    assert decision["parameters"]["retry_count"] == 3
    assert decision["parameters"]["retry_delay"] == [5, 15, 60]
    assert decision["risk_level"] == "low"

def test_rule_2_issuer_sms(test_db):
    engine_inst = InterventionEngine()
    engine_inst.reset_circuit()

    tx = Failure(
        tx_id="tx_iss_1",
        merchant_id="mer_1",
        amount=1999.0,
        reason="issuer_declined",
        failure_category="issuer",
        customer_name="Aarav Sharma",
        customer_history={"trust_score": 70, "phone": "+919876543210"}
    )
    diag = Diagnosis(
        failure_id="tx_iss_1",
        root_cause="issuer_declined",
        cause_category="issuer",
        severity="medium",
        recovery_probability=55,
        confidence=80,
        recommended_action="contact_customer"
    )
    test_db.add_all([tx, diag])
    test_db.commit()

    decision = engine_inst.decide_intervention(test_db, "tx_iss_1")
    assert decision["action"] == "CUSTOMER_SMS"
    assert decision["risk_level"] == "medium"
    assert "sms_template" in decision["parameters"]
    assert "https://rzp.io/r/tx_iss_1" in decision["parameters"]["sms_template"]

def test_rule_3_high_value_hinglish_voice(test_db):
    engine_inst = InterventionEngine()
    engine_inst.reset_circuit()

    tx = Failure(
        tx_id="tx_voice_1",
        merchant_id="mer_1",
        amount=35000.0,
        reason="otp_expired",
        failure_category="issuer",
        customer_name="Rohan Mehta",
        customer_history={"trust_score": 85, "phone": "+919812345678"}
    )
    diag = Diagnosis(
        failure_id="tx_voice_1",
        root_cause="otp_expired",
        cause_category="issuer",
        severity="high",
        recovery_probability=75,
        confidence=85,
        recommended_action="contact_customer"
    )
    test_db.add_all([tx, diag])
    test_db.commit()

    decision = engine_inst.decide_intervention(test_db, "tx_voice_1")
    assert decision["action"] == "VOICE_CALL"
    assert decision["risk_level"] == "high"
    assert decision["parameters"]["language"] == "hinglish"
    assert "Namaste Rohan Mehta ji!" in decision["parameters"]["voice_script"]

def test_bounded_rule_max_amount_auto_retry(test_db):
    """Test safety boundary: amount > 50k cannot auto-retry; escalated."""
    engine_inst = InterventionEngine()
    engine_inst.reset_circuit()

    tx = Failure(
        tx_id="tx_high_amount",
        merchant_id="mer_1",
        amount=65000.0, # Exceeds 50k
        reason="network_timeout",
        failure_category="network",
        customer_history={"trust_score": 60}
    )
    diag = Diagnosis(
        failure_id="tx_high_amount",
        root_cause="network_timeout",
        cause_category="network",
        severity="high",
        recovery_probability=80,
        confidence=85,
        recommended_action="retry"
    )
    test_db.add_all([tx, diag])
    test_db.commit()

    decision = engine_inst.decide_intervention(test_db, "tx_high_amount")
    assert decision["action"] == "MANUAL_ESCALATION"
    assert "exceeds auto-retry limit" in decision["reasoning"]

def test_circuit_breaker(test_db):
    """Test circuit breaker trips after 3 consecutive failures."""
    engine_inst = InterventionEngine()
    engine_inst.reset_circuit()

    # Simulate 3 failures
    for _ in range(3):
        engine_inst.record_circuit_failure()

    tx = Failure(
        tx_id="tx_circuit_test",
        merchant_id="mer_1",
        amount=2500.0,
        reason="network_timeout",
        failure_category="network",
        customer_history={"trust_score": 60}
    )
    diag = Diagnosis(
        failure_id="tx_circuit_test",
        root_cause="network_timeout",
        cause_category="network",
        severity="low",
        recovery_probability=80,
        confidence=85,
        recommended_action="retry"
    )
    test_db.add_all([tx, diag])
    test_db.commit()

    decision = engine_inst.decide_intervention(test_db, "tx_circuit_test")
    assert decision["action"] == "MANUAL_ESCALATION"
    assert "Circuit breaker tripped" in decision["reasoning"]

    # Reset
    engine_inst.reset_circuit()
