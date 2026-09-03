from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.schemas import InterveneRequest, InterventionResponse
from backend.agents.intervention import InterventionEngine
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Step 3: Intervention Decision Engine"])

intervention_engine = InterventionEngine()

@router.post("/intervene", response_model=InterventionResponse)
def decide_intervention(
    request: InterveneRequest,
    db: Session = Depends(get_db)
):
    """
    Step 3: Determine bounded recovery intervention.
    Applies deterministic decision trees (Auto-Retry, SMS, Hinglish Voice, Escalation)
    and enforces safety boundaries (max ₹50k, max 3 retries, circuit breaker).
    """
    try:
        result = intervention_engine.decide_intervention(db=db, failure_id=request.failure_id)
        return result
    except ValueError as ve:
        logger.warning(f"Validation error in /api/intervene: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /api/intervene: {e}")
        raise HTTPException(status_code=500, detail=str(e))
