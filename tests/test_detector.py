import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models import Base, Failure
from backend.agents.detector import FailureDetector

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()

def test_risk_score_calculation():
    detector = FailureDetector()

    # High amount, multiple attempts, high chargeback -> High risk score
    risk_high = detector.calculate_risk_score(
        amount=65000.0,
        attempts=2,
        chargeback_rate=0.8,
        customer_success_rate=40.0
    )
    assert risk_high >= 70
    assert risk_high <= 100

    # Low amount, 1 attempt, healthy merchant, reliable customer -> Low risk score
    risk_low = detector.calculate_risk_score(
        amount=1500.0,
        attempts=1,
        chargeback_rate=0.1,
        customer_success_rate=95.0
    )
    assert risk_low <= 40
    assert risk_low >= 5

def test_sync_and_detect(test_db):
    detector = FailureDetector()
    result = detector.sync_and_detect(test_db)

    assert result["total_failures"] == 100
    assert result["total_amount_at_risk"] > 2_000_000
    assert len(result["failures"]) == 100

    # Verify sorting by risk score descending
    scores = [f["risk_score"] for f in result["failures"]]
    assert scores == sorted(scores, reverse=True)

    # Verify categorized types exist
    categories = set(f["failure_category"] for f in result["failures"])
    assert "network" in categories
    assert "issuer" in categories
