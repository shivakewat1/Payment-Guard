from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.models import Failure, Diagnosis
from backend.integrations.claude_client import ClaudeClient
from backend.utils.logger import logger

class DiagnosisAgent:
    """
    Step 2: Root Cause Diagnosis Agent.
    Leverages Claude 3.5 AI (with rule-based fallback) to analyze why a transaction failed,
    evaluate customer and merchant context, and determine recovery probability and severity.
    """
    def __init__(self, claude_client: Optional[ClaudeClient] = None):
        self.claude = claude_client or ClaudeClient()

    def diagnose(self, db: Session, failure_id: str) -> Dict[str, Any]:
        """
        Diagnoses root cause for a specific failed transaction.
        Persists diagnosis to database and returns structured analysis.
        """
        failure = db.query(Failure).filter(Failure.tx_id == failure_id).first()
        if not failure:
            raise ValueError(f"Failure record '{failure_id}' not found in database")

        cust = failure.customer_history or {}
        merch = failure.merchant_metrics or {}

        logger.info(f"Diagnosis Agent analyzing failure {failure_id}: Reason '{failure.reason}', Amount Rs. {failure.amount}")

        diagnosis_result = self.claude.diagnose_failure(
            amount=failure.amount,
            reason=failure.reason,
            customer_email=cust.get("email", failure.customer_email or "customer@example.com"),
            success_rate=float(cust.get("success_rate", 80.0)),
            merchant_name=merch.get("name", "Merchant Partner"),
            chargeback_rate=float(merch.get("chargeback_rate", 0.3)),
            reason_description=failure.reason_description
        )

        confidence = diagnosis_result.get("confidence", 75)
        recommended_action = diagnosis_result.get("recommended_action", "retry")

        # As per brief: low confidence (<60%) gets escalated
        if confidence < 60:
            logger.warning(f"Diagnosis confidence low ({confidence}%). Escalating action to 'escalate'.")
            recommended_action = "escalate"
            diagnosis_result["recommended_action"] = "escalate"
            diagnosis_result["explanation"] += " [Escalated due to low diagnostic confidence]"

        # Upsert diagnosis record
        existing = db.query(Diagnosis).filter(Diagnosis.failure_id == failure_id).first()
        if not existing:
            diagnosis_record = Diagnosis(
                failure_id=failure_id,
                root_cause=diagnosis_result.get("root_cause", failure.reason),
                cause_category=diagnosis_result.get("cause_category", failure.failure_category),
                severity=diagnosis_result.get("severity", "medium"),
                recovery_probability=int(diagnosis_result.get("recovery_probability", 50)),
                confidence=confidence,
                recommended_action=recommended_action,
                explanation=diagnosis_result.get("explanation", ""),
                created_at=datetime.utcnow()
            )
            db.add(diagnosis_record)
        else:
            existing.root_cause = diagnosis_result.get("root_cause", failure.reason)
            existing.cause_category = diagnosis_result.get("cause_category", failure.failure_category)
            existing.severity = diagnosis_result.get("severity", "medium")
            existing.recovery_probability = int(diagnosis_result.get("recovery_probability", 50))
            existing.confidence = confidence
            existing.recommended_action = recommended_action
            existing.explanation = diagnosis_result.get("explanation", "")

        # Update failure status to processing
        if failure.status == "detected":
            failure.status = "processing"

        db.commit()

        return {
            "failure_id": failure_id,
            "root_cause": diagnosis_result.get("root_cause", failure.reason),
            "cause_category": diagnosis_result.get("cause_category", failure.failure_category),
            "severity": diagnosis_result.get("severity", "medium"),
            "recovery_probability": int(diagnosis_result.get("recovery_probability", 50)),
            "recommended_action": recommended_action,
            "confidence": confidence,
            "explanation": diagnosis_result.get("explanation", "")
        }
