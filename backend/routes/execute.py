from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.schemas import ExecuteRequest, ExecuteResponse
from backend.agents.executor import RecoveryExecutor
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Step 4: Recovery Execution & Audit"])

executor = RecoveryExecutor()

@router.post("/execute", response_model=ExecuteResponse)
def execute_intervention(
    request: ExecuteRequest,
    db: Session = Depends(get_db)
):
    """
    Step 4: Execute recovery intervention and maintain step-by-step audit logs.
    Handles network errors gracefully, retries with exponential backoff, and computes recovered capital.
    """
    try:
        result = executor.execute_intervention(db=db, intervention_id=request.intervention_id)
        return result
    except ValueError as ve:
        logger.warning(f"Validation error in /api/execute: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /api/execute: {e}")
        raise HTTPException(status_code=500, detail=str(e))
