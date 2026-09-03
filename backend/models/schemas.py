from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== STEP 1: DETECT ====================
class DetectRequest(BaseModel):
    merchant_id: Optional[str] = "all"
    days: Optional[int] = 7
    min_amount: Optional[float] = 0.0
    filter_by_type: Optional[str] = "all" # all, network, issuer, merchant, customer

class FailureItem(BaseModel):
    tx_id: str
    amount: float
    currency: str = "INR"
    reason: str
    reason_description: Optional[str] = None
    failure_category: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    timestamp: str
    risk_score: int = Field(ge=0, le=100)
    attempts: int = 1
    last_attempt: Optional[str] = None
    status: str = "detected"
    payment_method: Optional[str] = None
    is_test_special: Optional[bool] = False

class DetectResponse(BaseModel):
    failures: List[FailureItem]
    total_amount_at_risk: float
    total_failures: int

# ==================== STEP 2: DIAGNOSE ====================
class DiagnoseRequest(BaseModel):
    failure_id: str # e.g. tx_1001

class DiagnosisResponse(BaseModel):
    failure_id: str
    root_cause: str
    cause_category: str # network/issuer/merchant/customer
    severity: str # low/medium/high
    recovery_probability: int = Field(ge=0, le=100)
    recommended_action: str # retry/contact_customer/escalate
    confidence: int = Field(ge=0, le=100)
    explanation: str

# ==================== STEP 3: INTERVENE ====================
class InterveneRequest(BaseModel):
    failure_id: str

class StoppingRules(BaseModel):
    max_retries: int = 3
    max_amount_auto_retry: float = 50000.0
    max_daily_attempts: int = 2
    circuit_breaker_threshold: int = 3

class InterventionResponse(BaseModel):
    intervention_id: str
    failure_id: str
    action: str # AUTO_RETRY/CUSTOMER_SMS/VOICE_CALL/MANUAL_ESCALATION
    parameters: Dict[str, Any]
    risk_level: str # low/medium/high
    stopping_rules: StoppingRules
    reasoning: Optional[str] = None

# ==================== STEP 4: EXECUTE ====================
class ExecuteRequest(BaseModel):
    intervention_id: str

class StepRecord(BaseModel):
    step: int
    action: str
    timestamp: str
    status: str
    api_response_time: Optional[str] = None
    result: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ExecuteResponse(BaseModel):
    execution_id: str
    failure_id: str
    intervention_id: str
    action: str
    status: str # success/failed/pending
    money_recovered: float
    duration_seconds: float
    steps: List[Dict[str, Any]]
    exceptions: Optional[Dict[str, Any]] = None

# ==================== BATCH PIPELINE ====================
class BatchRunRequest(BaseModel):
    merchant_id: Optional[str] = "all"
    limit: Optional[int] = 100

class BatchRunResponse(BaseModel):
    batch_id: str
    processed_count: int
    recovered_count: int
    recovered_amount: float
    recovery_rate_percent: float
    audit_logs_created: int
    message: str

# ==================== AUDIT TRAIL ====================
class AuditTrailResponse(BaseModel):
    failure_id: str
    audit_logs: List[Dict[str, Any]]

# ==================== METRICS ====================
class InputMetrics(BaseModel):
    total_failures_detected: int
    total_amount_at_risk: float
    avg_failure_amount: float

class ProcessingMetrics(BaseModel):
    interventions_executed: int
    auto_retries: int
    customer_sms: int
    voice_calls: int
    manual_escalations: int

class RecoveryMetrics(BaseModel):
    payments_recovered: int
    amount_recovered: float
    recovery_rate_percent: float
    avg_recovery_per_tx: float

class QualityMetrics(BaseModel):
    interventions_success: int
    interventions_failed: int
    success_rate: float
    avg_recovery_time_minutes: float

class ExceptionHandlingMetrics(BaseModel):
    total_exceptions: int
    gracefully_handled: int
    unhandled: int
    top_exception_type: str

class ComplianceMetrics(BaseModel):
    audit_logs_created: int
    all_actions_tracked: bool
    escalation_rules_followed: bool
    gdpr_compliant: bool
    bounded_workflow_enforced: bool

class MetricsReport(BaseModel):
    batch_id: str
    generated_at: str
    input_metrics: InputMetrics
    processing_metrics: ProcessingMetrics
    recovery_metrics: RecoveryMetrics
    quality_metrics: QualityMetrics
    exception_handling: ExceptionHandlingMetrics
    compliance: ComplianceMetrics
