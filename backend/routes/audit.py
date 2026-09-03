from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database.models import AuditLog
from backend.models.schemas import AuditTrailResponse

router = APIRouter(prefix="/api", tags=["Audit Trail"])

@router.get("/audit-trail/{failure_id}")
def get_audit_trail(
    failure_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves complete historical audit trail for a transaction.
    Shows execution steps, timestamps, API latency, and handled exceptions.
    """
    logs = db.query(AuditLog).filter(AuditLog.failure_id == failure_id).order_by(AuditLog.created_at.desc()).all()
    
    formatted = [
        {
            "id": log.id,
            "execution_id": log.execution_id,
            "failure_id": log.failure_id,
            "intervention_id": log.intervention_id,
            "action": log.action,
            "status": log.status,
            "money_recovered": log.money_recovered,
            "duration_seconds": log.duration_seconds,
            "steps": log.steps or [],
            "exceptions": log.exceptions,
            "created_by": log.created_by,
            "created_at": log.created_at.isoformat() + "Z",
            "updated_at": log.updated_at.isoformat() + "Z" if log.updated_at else None
        }
        for log in logs
    ]

    return {
        "failure_id": failure_id,
        "audit_logs": formatted
    }
