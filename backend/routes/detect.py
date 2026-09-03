from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.db import get_db
from backend.models.schemas import DetectRequest, DetectResponse
from backend.agents.detector import FailureDetector
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Step 1: Failure Detection"])

detector = FailureDetector()

@router.post("/detect", response_model=DetectResponse)
def detect_failures(
    request: DetectRequest,
    db: Session = Depends(get_db)
):
    """
    Step 1: Detect failed transactions from Razorpay.
    Parses failure reasons, computes risk scores (0-100), and flags high-risk revenue.
    """
    try:
        result = detector.sync_and_detect(
            db=db,
            merchant_id=request.merchant_id or "all",
            days=request.days or 7,
            min_amount=request.min_amount or 0.0,
            filter_by_type=request.filter_by_type or "all"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /api/detect: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/failures")
def list_failures(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    filter_by_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500)
):
    """
    Convenience endpoint for frontend dashboard to retrieve stored failures.
    """
    from backend.database.models import Failure
    query = db.query(Failure)
    if status and status != "all":
        query = query.filter(Failure.status == status)
    if filter_by_type and filter_by_type != "all":
        query = query.filter(Failure.failure_category == filter_by_type)

    failures = query.order_by(Failure.risk_score.desc()).limit(limit).all()
    total_amount = sum(f.amount for f in failures)

    return {
        "failures": [
            {
                "tx_id": f.tx_id,
                "merchant_id": f.merchant_id,
                "amount": f.amount,
                "currency": f.currency,
                "reason": f.reason,
                "reason_description": f.reason_description,
                "failure_category": f.failure_category,
                "customer_id": f.customer_id,
                "customer_name": f.customer_name,
                "customer_email": f.customer_email,
                "customer_phone": f.customer_phone,
                "timestamp": f.created_at.isoformat() + "Z",
                "risk_score": f.risk_score,
                "attempts": f.attempts,
                "status": f.status,
                "is_test_special": (f.tx_id == "tx_1001")
            }
            for f in failures
        ],
        "total_amount_at_risk": total_amount,
        "total_failures": len(failures)
    }
