from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.models import Failure
from backend.integrations.razorpay_client import RazorpayClient
from backend.utils.logger import logger

class FailureDetector:
    """
    Step 1: Payment Failure Detector Agent.
    Identifies failed transactions, categorizes root cause domain, computes dynamic
    risk scores, and prioritizes at-risk revenue.
    """
    def __init__(self, razorpay_client: Optional[RazorpayClient] = None):
        self.rzp = razorpay_client or RazorpayClient()

    @staticmethod
    def calculate_risk_score(
        amount: float,
        attempts: int = 1,
        chargeback_rate: float = 0.3,
        customer_success_rate: float = 85.0
    ) -> int:
        """
        Calculates a dynamic risk score between 0 and 100 based on:
        1. Transaction amount exposure
        2. Frequency of customer failure attempts
        3. Merchant chargeback rate
        4. Customer baseline reliability
        """
        score = 0.0

        # 1. Amount exposure (up to 40 pts)
        if amount > 50000:
            score += 40
        elif amount > 25000:
            score += 30
        elif amount > 10000:
            score += 20
        elif amount > 3000:
            score += 12
        else:
            score += 6

        # 2. Failure attempts frequency (up to 30 pts)
        score += min(attempts * 12, 30)

        # 3. Merchant chargeback risk (up to 20 pts)
        # Chargeback rates above 0.5% are considered risky in India
        cb_score = min(chargeback_rate * 25, 20)
        score += cb_score

        # 4. Customer history adjustment (-15 to +15 pts)
        if customer_success_rate < 50.0:
            score += 15
        elif customer_success_rate < 75.0:
            score += 8
        elif customer_success_rate > 90.0:
            score -= 10

        # Clamp between 5 and 100
        return int(max(5, min(100, round(score))))

    def sync_and_detect(
        self,
        db: Session,
        merchant_id: str = "all",
        days: int = 7,
        min_amount: float = 0.0,
        filter_by_type: str = "all"
    ) -> Dict[str, Any]:
        """
        Detects failed transactions from Razorpay / dataset and persists to database.
        Returns prioritized failures sorted by risk score descending.
        """
        raw_failures = self.rzp.fetch_failed_payments(days=days, min_amount=min_amount)

        # Upsert into database
        for item in raw_failures:
            tx_id = item.get("tx_id")
            existing = db.query(Failure).filter(Failure.tx_id == tx_id).first()

            cust = item.get("customer", {})
            merch = item.get("merchant", {})
            amount = float(item.get("amount", 0.0))
            attempts = int(item.get("attempts", 1))

            risk = self.calculate_risk_score(
                amount=amount,
                attempts=attempts,
                chargeback_rate=float(merch.get("chargeback_rate", 0.3)),
                customer_success_rate=float(cust.get("success_rate", 80.0))
            )

            if not existing:
                record = Failure(
                    tx_id=tx_id,
                    merchant_id=merch.get("id", "mer_default"),
                    amount=amount,
                    currency=item.get("currency", "INR"),
                    reason=item.get("reason", "unknown_failure"),
                    reason_description=item.get("reason_description", ""),
                    failure_category=item.get("failure_category", "network"),
                    customer_id=cust.get("customer_id"),
                    customer_name=cust.get("name"),
                    customer_email=cust.get("email"),
                    customer_phone=cust.get("phone"),
                    risk_score=risk,
                    status="detected",
                    attempts=attempts,
                    customer_history=cust,
                    merchant_metrics=merch,
                    created_at=datetime.utcnow()
                )
                db.add(record)
            else:
                existing.risk_score = risk

        db.commit()

        # Query and apply filters
        query = db.query(Failure)
        if merchant_id != "all":
            query = query.filter(Failure.merchant_id == merchant_id)
        if min_amount > 0:
            query = query.filter(Failure.amount >= min_amount)
        if filter_by_type != "all":
            query = query.filter(Failure.failure_category == filter_by_type)

        failures = query.order_by(Failure.risk_score.desc()).all()

        total_amount_at_risk = sum(f.amount for f in failures)
        total_failures = len(failures)

        logger.info(f"Detector Agent: Identified {total_failures} failures. Total at risk: Rs. {total_amount_at_risk:,.2f}")

        formatted_failures = [
            {
                "tx_id": f.tx_id,
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
                "last_attempt": f.last_attempt.isoformat() + "Z" if f.last_attempt else None,
                "is_test_special": (f.tx_id == "tx_1001")
            }
            for f in failures
        ]

        return {
            "failures": formatted_failures,
            "total_amount_at_risk": total_amount_at_risk,
            "total_failures": total_failures
        }
