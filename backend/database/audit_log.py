from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from .models import AuditLog
from backend.utils.logger import logger

class AuditLogger:
    @staticmethod
    def start_execution(
        db: Session,
        execution_id: str,
        failure_id: str,
        action: str,
        intervention_id: Optional[str] = None
    ) -> AuditLog:
        """Initializes an audit log record with pending status."""
        entry = AuditLog(
            execution_id=execution_id,
            failure_id=failure_id,
            intervention_id=intervention_id,
            action=action,
            status="pending",
            money_recovered=0.0,
            steps=[],
            exceptions=None,
            duration_seconds=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        logger.info(f"Audit log initialized for execution {execution_id}, failure {failure_id}, action {action}")
        return entry

    @staticmethod
    def log_step(
        db: Session,
        execution_id: str,
        step_number: int,
        action_description: str,
        status: str = "completed",
        api_response_time: Optional[str] = None,
        result: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Appends a sequential step to the audit trail."""
        entry = db.query(AuditLog).filter(AuditLog.execution_id == execution_id).first()
        if not entry:
            logger.warning(f"Audit log for {execution_id} not found to log step {step_number}")
            return None

        # Re-assign steps list to trigger SQLAlchemy JSON detection
        current_steps = list(entry.steps or [])
        step_data = {
            "step": step_number,
            "action": action_description,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": status
        }
        if api_response_time:
            step_data["api_response_time"] = api_response_time
        if result:
            step_data["result"] = result
        if details:
            step_data["details"] = details

        current_steps.append(step_data)
        entry.steps = current_steps
        entry.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def log_exception(
        db: Session,
        execution_id: str,
        exception_type: str,
        handled_by: str,
        recovery_action: str
    ):
        """Logs handled or unhandled exception in audit log."""
        entry = db.query(AuditLog).filter(AuditLog.execution_id == execution_id).first()
        if not entry:
            return None

        entry.exceptions = {
            "exception_type": exception_type,
            "handled_by": handled_by,
            "recovery_action": recovery_action,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        entry.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(entry)
        logger.warning(f"Exception recorded in audit {execution_id}: {exception_type} -> handled by {handled_by}")
        return entry

    @staticmethod
    def complete_execution(
        db: Session,
        execution_id: str,
        status: str,
        money_recovered: float = 0.0,
        error_message: Optional[str] = None
    ) -> AuditLog:
        """Finalizes the execution record with duration and recovery outcome."""
        entry = db.query(AuditLog).filter(AuditLog.execution_id == execution_id).first()
        if not entry:
            raise ValueError(f"Audit log entry {execution_id} not found")

        now = datetime.utcnow()
        duration = max(0.1, (now - entry.created_at).total_seconds())

        entry.status = status
        entry.money_recovered = money_recovered
        entry.duration_seconds = round(duration, 2)
        entry.updated_at = now

        db.commit()
        db.refresh(entry)
        logger.info(f"Audit log {execution_id} completed. Status: {status}, Recovered: Rs. {money_recovered:,}, Duration: {duration:.2f}s")
        return entry

    @staticmethod
    def get_by_failure_id(db: Session, failure_id: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(AuditLog.failure_id == failure_id).order_by(AuditLog.created_at.desc()).all()
