import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.database.db import engine, Base

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c

def test_full_pipeline_single_transaction(client):
    """Tests Detect -> Diagnose -> Intervene -> Execute -> Audit Trail on a single tx."""
    # 1. Detect
    res_detect = client.post("/api/detect", json={"days": 7, "min_amount": 0})
    assert res_detect.status_code == 200
    data = res_detect.json()
    assert data["total_failures"] == 100
    assert len(data["failures"]) > 0

    target_tx = data["failures"][0]["tx_id"]

    # 2. Diagnose
    res_diag = client.post("/api/diagnose", json={"failure_id": target_tx})
    assert res_diag.status_code == 200
    diag_data = res_diag.json()
    assert diag_data["failure_id"] == target_tx
    assert "root_cause" in diag_data
    assert "recovery_probability" in diag_data

    # 3. Intervene
    res_interv = client.post("/api/intervene", json={"failure_id": target_tx})
    assert res_interv.status_code == 200
    interv_data = res_interv.json()
    assert "intervention_id" in interv_data
    assert interv_data["action"] in ["AUTO_RETRY", "CUSTOMER_SMS", "VOICE_CALL", "MANUAL_ESCALATION"]

    # 4. Execute
    res_exec = client.post("/api/execute", json={"intervention_id": interv_data["intervention_id"]})
    assert res_exec.status_code == 200
    exec_data = res_exec.json()
    assert exec_data["status"] in ["success", "failed"]
    assert "steps" in exec_data
    assert len(exec_data["steps"]) >= 2

    # 5. Audit Trail
    res_audit = client.get(f"/api/audit-trail/{target_tx}")
    assert res_audit.status_code == 200
    audit_data = res_audit.json()
    assert len(audit_data["audit_logs"]) >= 1
    assert audit_data["audit_logs"][0]["execution_id"] == exec_data["execution_id"]

def test_metrics_endpoint(client):
    """Verifies the metrics reporting structure."""
    res = client.get("/api/metrics")
    assert res.status_code == 200
    metrics = res.json()

    assert "input_metrics" in metrics
    assert "processing_metrics" in metrics
    assert "recovery_metrics" in metrics
    assert "quality_metrics" in metrics
    assert "exception_handling" in metrics
    assert "compliance" in metrics
    assert metrics["compliance"]["all_actions_tracked"] is True
    assert metrics["compliance"]["bounded_workflow_enforced"] is True

def test_batch_run_10_transactions(client):
    """Runs a batch run for 10 transactions to test batch orchestration."""
    res = client.post("/api/batch-run", json={"limit": 10})
    assert res.status_code == 200
    batch_data = res.json()
    assert batch_data["processed_count"] == 10
    assert batch_data["audit_logs_created"] == 10
    assert batch_data["recovery_rate_percent"] >= 0.0
