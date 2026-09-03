import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.models import Failure, Diagnosis, Intervention
from backend.config import settings
from backend.utils.logger import logger

class InterventionEngine:
    """
    Step 3: Intervention Decision Engine.
    Implements a bounded, explainable decision workflow adhering strictly to
    Razorpay Track 03 requirements and risk constraints.
    """
    consecutive_failures_count: int = 0

    @classmethod
    def record_circuit_failure(cls):
        cls.consecutive_failures_count += 1

    @classmethod
    def reset_circuit(cls):
        cls.consecutive_failures_count = 0

    def decide_intervention(self, db: Session, failure_id: str) -> Dict[str, Any]:
        """
        Evaluates failure and diagnosis parameters against decision rules
        and stopping boundaries. Returns an action plan.
        """
        failure = db.query(Failure).filter(Failure.tx_id == failure_id).first()
        if not failure:
            raise ValueError(f"Failure record '{failure_id}' not found")

        diagnosis = db.query(Diagnosis).filter(Diagnosis.failure_id == failure_id).first()
        if not diagnosis:
            # If not yet diagnosed, trigger diagnosis agent first
            from backend.agents.diagnosis import DiagnosisAgent
            diag_agent = DiagnosisAgent()
            diagnosis_data = diag_agent.diagnose(db, failure_id)
            diagnosis = db.query(Diagnosis).filter(Diagnosis.failure_id == failure_id).first()

        cust = failure.customer_history or {}
        merch = failure.merchant_metrics or {}
        trust_score = float(cust.get("trust_score", 70.0))
        recovery_prob = diagnosis.recovery_probability
        amount = failure.amount
        root_cause_cat = diagnosis.cause_category.lower()
        root_cause_name = diagnosis.root_cause.lower()

        logger.info(f"Intervention Engine evaluating {failure_id}: Category='{root_cause_cat}', Amount=Rs. {amount}, Trust={trust_score}, RecProb={recovery_prob}%")

        # Circuit breaker check:
        circuit_broken = (self.consecutive_failures_count >= settings.CIRCUIT_BREAKER_THRESHOLD)

        # Base Decision Tree Evaluation:
        action = None
        params: Dict[str, Any] = {}
        risk_level = "low"
        reasoning = ""

        if circuit_broken:
            action = "MANUAL_ESCALATION"
            risk_level = "high"
            reasoning = f"Circuit breaker tripped after {self.consecutive_failures_count} consecutive recovery failures. Escalate to prevent cascading load."
            self.reset_circuit() # Cooldown reset to probe subsequent traffic safely
            params = {
                "assigned_to": "support_team",
                "priority": "critical",
                "reason": "circuit_breaker_triggered",
                "escalation_team": "support"
            }

        # Rule 1: IF root_cause == "network":
        elif root_cause_cat == "network" or any(w in root_cause_name for w in ["network", "gateway", "timeout", "socket"]):
            action = "AUTO_RETRY"
            retries = 3
            risk_level = "low"
            reasoning = "Transient network disruption detected. Automatic exponential backoff retry recommended."
            params = {
                "retry_count": retries,
                "retry_delay": settings.RETRY_DELAYS_MINUTES, # [5, 15, 60] minutes
                "gateway_channel": "razorpay_direct_switch"
            }

        # Rule 2: ELIF root_cause == "issuer" AND amount < 5000:
        elif (root_cause_cat == "issuer" or "issuer" in root_cause_name) and amount < 5000:
            action = "CUSTOMER_SMS"
            risk_level = "medium"
            reasoning = "Low-ticket card/OTP decline. Customer intervention via targeted SMS retry link is optimal."
            customer_name = cust.get("name", failure.customer_name or "Customer")
            sms_text = f"Payment of ₹{amount:,.0f} failed on {merch.get('name', 'merchant')}. Click here to retry with same card, UPI or NetBanking: https://rzp.io/r/{failure.tx_id} - Powered by Razorpay PaymentGuard"
            params = {
                "sms_template": sms_text,
                "recipient_phone": cust.get("phone", failure.customer_phone or "+919800000000"),
                "timeout_hours": 24,
                "alternate_channels": ["upi", "card", "netbanking"]
            }

        # Rule 3: ELIF amount > 10000 AND customer.trust_score > 75:
        elif amount > 10000 and trust_score > 75:
            action = "VOICE_CALL"
            language = "hinglish"
            risk_level = "high"
            reasoning = f"High-value payment (₹{amount:,.0f}) with VIP trusted customer (Trust Score: {trust_score}%). Proactive conversational Hinglish voice recovery initiated."
            customer_name = cust.get("name", failure.customer_name or "Customer")
            merchant_name = merch.get("name", "Merchant Partner")
            voice_script = (
                f"Namaste {customer_name} ji! Main PaymentGuard AI assistant bol raha hoon on behalf of {merchant_name}. "
                f"Aapka ₹{amount:,.0f} ka transaction bank server delay ki wajah se complete nahi ho paya tha. "
                f"Maine aapke WhatsApp aur SMS par direct 1-click retry link send kar diya hai. "
                f"Kya aap abhi payment retry karna chahenge? Shukriya!"
            )
            params = {
                "voice_script": voice_script,
                "language": language,
                "escalation": "yes",
                "recipient_phone": cust.get("phone", failure.customer_phone or "+919800000000"),
                "max_duration_seconds": 90,
                "voice_agent_persona": "Priya (Razorpay Concierge)"
            }

        # Rule 4: ELIF root_cause == "merchant" OR recovery_probability < 30:
        elif root_cause_cat == "merchant" or recovery_prob < 30 or "merchant" in root_cause_name:
            action = "MANUAL_ESCALATION"
            risk_level = "high"
            reasoning = f"Merchant configuration failure or unrecoverable rate (Recovery Prob: {recovery_prob}%). Routed directly to Merchant Success desk."
            params = {
                "assigned_to": "support_team",
                "priority": "medium",
                "escalation_team": "support",
                "ticket_summary": f"Merchant revenue issue: {failure.reason} for {merch.get('name', 'Merchant')} - ₹{amount:,.0f}"
            }

        # Rule 5: ELSE:
        else:
            action = "AUTO_RETRY"
            risk_level = "low"
            reasoning = "Standard failure with moderate recovery confidence. Single safe auto-retry scheduled."
            params = {
                "retry_count": 1,
                "retry_delay": [5],
                "gateway_channel": "razorpay_direct_switch"
            }

        # BOUNDARY ENFORCEMENT:
        # 1. No auto-retry for amount > ₹50,000 without manual approval
        if action == "AUTO_RETRY" and amount > settings.MAX_AMOUNT_AUTO_RETRY:
            logger.warning(f"Safety boundary triggered: Amount ₹{amount} exceeds ₹{settings.MAX_AMOUNT_AUTO_RETRY} limit for AUTO_RETRY. Escalating to MANUAL_ESCALATION.")
            action = "MANUAL_ESCALATION"
            risk_level = "high"
            reasoning = f"Boundary rule: Amount ₹{amount:,.0f} exceeds auto-retry limit of ₹{settings.MAX_AMOUNT_AUTO_RETRY:,.0f}. Manual signoff required."
            params = {
                "assigned_to": "senior_risk_team",
                "priority": "high",
                "reason": "amount_exceeds_auto_retry_threshold",
                "amount": amount
            }

        # 2. Maximum retries capped strictly at 3
        if "retry_count" in params:
            params["retry_count"] = min(params["retry_count"], settings.MAX_RETRIES)

        stopping_rules = {
            "max_retries": settings.MAX_RETRIES,
            "max_amount_auto_retry": settings.MAX_AMOUNT_AUTO_RETRY,
            "max_daily_attempts": 2,
            "circuit_breaker_threshold": settings.CIRCUIT_BREAKER_THRESHOLD
        }

        intervention_id = f"iv_{uuid.uuid4().hex[:8]}"

        # Upsert intervention
        existing_int = db.query(Intervention).filter(Intervention.failure_id == failure_id).first()
        if not existing_int:
            intervention_record = Intervention(
                intervention_id=intervention_id,
                failure_id=failure_id,
                action=action,
                parameters=params,
                risk_level=risk_level,
                stopping_rules=stopping_rules,
                status="pending",
                created_at=datetime.utcnow()
            )
            db.add(intervention_record)
        else:
            intervention_id = existing_int.intervention_id
            existing_int.action = action
            existing_int.parameters = params
            existing_int.risk_level = risk_level
            existing_int.stopping_rules = stopping_rules
            existing_int.status = "pending"

        db.commit()

        return {
            "intervention_id": intervention_id,
            "failure_id": failure_id,
            "action": action,
            "parameters": params,
            "risk_level": risk_level,
            "stopping_rules": stopping_rules,
            "reasoning": reasoning
        }
