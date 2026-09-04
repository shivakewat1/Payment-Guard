from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.db import get_db
from backend.database.models import Failure, Diagnosis, Intervention, AuditLog
from backend.models.schemas import BatchRunRequest, BatchRunResponse
from backend.agents.detector import FailureDetector
from backend.agents.diagnosis import DiagnosisAgent
from backend.agents.intervention import InterventionEngine
from backend.agents.executor import RecoveryExecutor
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Batch Execution Pipeline"])

detector = FailureDetector()
diagnostician = DiagnosisAgent()
decider = InterventionEngine()
executor = RecoveryExecutor()

@router.post("/batch-run", response_model=BatchRunResponse)
def run_batch_pipeline(
    request: BatchRunRequest,
    db: Session = Depends(get_db)
):
    """
    Executes the entire end-to-end 4-step workflow on all detected failures:
    DETECT -> DIAGNOSE -> INTERVENE -> EXECUTE & AUDIT.
    Perfect for 1-click end-to-end demo and video presentation.
    """
    batch_id = f"batch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    logger.info(f"Starting batch recovery pipeline: {batch_id}")

    # 1. Detect and ensure transactions are synced
    detection_res = detector.sync_and_detect(db=db, merchant_id=request.merchant_id or "all")
    failures = db.query(Failure).all()
    if request.limit:
        failures = failures[:request.limit]

    total_amount_at_risk = sum(f.amount for f in failures)
    processed_count = 0
    recovered_count = 0
    recovered_amount = 0.0
    recovered_tx_ids = set()

    for f in failures:
        try:
            # 2. Diagnose
            diag = diagnostician.diagnose(db, f.tx_id)

            # 3. Intervene
            interv = decider.decide_intervention(db, f.tx_id)

            # 4. Execute
            exec_res = executor.execute_intervention(db, interv["intervention_id"])

            processed_count += 1
            if exec_res.get("status") == "success" and f.tx_id not in recovered_tx_ids:
                recovered_tx_ids.add(f.tx_id)
                recovered_count += 1
                recovered_amount += f.amount

        except Exception as err:
            logger.error(f"Error processing transaction {f.tx_id} in batch: {err}")

    # Sanity check assertions
    if recovered_amount > total_amount_at_risk and total_amount_at_risk > 0:
        logger.warning(
            f"Sanity Violation Warning in Batch: recovered_amount (₹{recovered_amount:,.2f}) > total_amount_at_risk (₹{total_amount_at_risk:,.2f}). Clamping to total_amount_at_risk."
        )
        recovered_amount = total_amount_at_risk

    recovery_rate = round((recovered_count / processed_count * 100.0), 1) if processed_count > 0 else 0.0

    if recovery_rate > 100.0:
        logger.warning(f"Sanity Violation Warning in Batch: recovery_rate ({recovery_rate}%) > 100%. Clamping to 100.0%.")
        recovery_rate = 100.0
    elif recovery_rate < 0.0:
        recovery_rate = 0.0

    logger.info(f"Batch {batch_id} finished. Processed: {processed_count}, Recovered: {recovered_count} (Rs. {recovered_amount:,.2f}, {recovery_rate}%)")

    return BatchRunResponse(
        batch_id=batch_id,
        processed_count=processed_count,
        recovered_count=recovered_count,
        recovered_amount=recovered_amount,
        recovery_rate_percent=recovery_rate,
        audit_logs_created=processed_count,
        message=f"Batch workflow executed successfully. Recovered Rs. {recovered_amount:,.2f} ({recovery_rate}% recovery rate)."
    )

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Resets all diagnoses, interventions, and audit logs, returning failures
    to their initial 'detected' status. Essential for clean re-runs during demos.
    """
    try:
        db.query(AuditLog).delete()
        db.query(Intervention).delete()
        db.query(Diagnosis).delete()
        
        # Reset failures status
        failures = db.query(Failure).all()
        for f in failures:
            f.status = "detected"
        db.commit()
        InterventionEngine.reset_circuit()
        logger.info("Demo state successfully reset to initial baseline.")
        return {"status": "success", "message": "Demo database successfully reset."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
