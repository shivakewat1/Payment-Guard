from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.schemas import DiagnoseRequest, DiagnosisResponse
from backend.agents.diagnosis import DiagnosisAgent
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Step 2: Root Cause Diagnosis"])

diagnosis_agent = DiagnosisAgent()

@router.post("/diagnose", response_model=DiagnosisResponse)
def diagnose_failure(
    request: DiagnoseRequest,
    db: Session = Depends(get_db)
):
    """
    Step 2: Diagnose root cause using Claude 3.5 AI reasoning.
    Evaluates transaction metadata, customer success rate, and merchant health.
    """
    try:
        result = diagnosis_agent.diagnose(db=db, failure_id=request.failure_id)
        return result
    except ValueError as ve:
        logger.warning(f"Validation error in /api/diagnose: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /api/diagnose: {e}")
        raise HTTPException(status_code=500, detail=str(e))
