# PaymentGuard: API Specification
**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`

---

## Overview
PaymentGuard exposes a RESTful API built on FastAPI. All request and response bodies use standard JSON format.

---

## Endpoints Summary

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/detect` | Step 1: Ingest & prioritize failed transactions |
| `GET` | `/api/failures` | List all cached failures with filtering |
| `POST` | `/api/diagnose` | Step 2: Claude AI root-cause analysis |
| `POST` | `/api/intervene` | Step 3: Bounded decision engine planning |
| `POST` | `/api/execute` | Step 4: Multi-channel recovery execution |
| `GET` | `/api/audit-trail/{failure_id}` | Retrieve sequential audit logs and exceptions |
| `GET` | `/api/metrics` | Step 5: Honest metrics and batch summary |
| `POST` | `/api/batch-run` | Orchestrate end-to-end recovery pipeline for batch |
| `POST` | `/api/reset` | Reset state for demo re-runs |

---

## Detailed Endpoint Specifications

### 1. Detect Failures
`POST /api/detect`

**Request Body:**
```json
{
  "merchant_id": "all",
  "days": 7,
  "min_amount": 100,
  "filter_by_type": "all"
}
```

**Response (200 OK):**
```json
{
  "failures": [
    {
      "tx_id": "tx_1001",
      "amount": 22500,
      "currency": "INR",
      "reason": "network_timeout",
      "reason_description": "Bank gateway did not respond within 30000ms",
      "failure_category": "network",
      "customer_id": "cust_12345",
      "customer_name": "Aarav Sharma",
      "customer_email": "aarav.sharma@gmail.com",
      "customer_phone": "+919876543210",
      "timestamp": "2026-08-20T10:30:00Z",
      "risk_score": 68,
      "attempts": 1,
      "status": "detected",
      "is_test_special": true
    }
  ],
  "total_amount_at_risk": 2572335,
  "total_failures": 100
}
```

---

### 2. Diagnose Failure
`POST /api/diagnose`

**Request Body:**
```json
{
  "failure_id": "tx_1001"
}
```

**Response (200 OK):**
```json
{
  "failure_id": "tx_1001",
  "root_cause": "network_timeout",
  "cause_category": "network",
  "severity": "medium",
  "recovery_probability": 82,
  "recommended_action": "retry",
  "confidence": 88,
  "explanation": "Transient connectivity disruption between merchant gateway and acquiring switch. Customer history shows high baseline reliability. Safe to auto-retry."
}
```

---

### 3. Decide Intervention
`POST /api/intervene`

**Request Body:**
```json
{
  "failure_id": "tx_1001"
}
```

**Response (200 OK):**
```json
{
  "intervention_id": "iv_8a129d3b",
  "failure_id": "tx_1001",
  "action": "AUTO_RETRY",
  "parameters": {
    "retry_count": 3,
    "retry_delay": [5, 15, 60],
    "gateway_channel": "razorpay_direct_switch"
  },
  "risk_level": "low",
  "stopping_rules": {
    "max_retries": 3,
    "max_amount_auto_retry": 50000,
    "max_daily_attempts": 2,
    "circuit_breaker_threshold": 3
  },
  "reasoning": "Transient network disruption detected. Automatic exponential backoff retry recommended."
}
```

---

### 4. Execute Intervention
`POST /api/execute`

**Request Body:**
```json
{
  "intervention_id": "iv_8a129d3b"
}
```

**Response (200 OK):**
```json
{
  "execution_id": "exec_5f3089c1",
  "failure_id": "tx_1001",
  "intervention_id": "iv_8a129d3b",
  "action": "AUTO_RETRY",
  "status": "success",
  "money_recovered": 22500,
  "duration_seconds": 1.45,
  "steps": [
    {
      "step": 1,
      "action": "Fetching transaction details and merchant configuration",
      "timestamp": "2026-08-20T10:35:00Z",
      "status": "completed",
      "result": "Tx ID: tx_1001, Amount: ₹22,500.00"
    },
    {
      "step": 2,
      "action": "Razorpay Authorization Retry (Attempt 1/3)",
      "timestamp": "2026-08-20T10:35:01Z",
      "status": "completed",
      "api_response_time": "285ms",
      "result": "Network timeout: Bank gateway did not respond within 30000ms - Scheduled exponential backoff delay (5min)"
    },
    {
      "step": 3,
      "action": "Razorpay Authorization Retry (Attempt 2/3)",
      "timestamp": "2026-08-20T10:35:02Z",
      "status": "completed",
      "api_response_time": "312ms",
      "result": "Network timeout: Bank gateway did not respond within 30000ms - Scheduled exponential backoff delay (15min)"
    },
    {
      "step": 4,
      "action": "Razorpay Authorization Retry (Attempt 3/3)",
      "timestamp": "2026-08-20T10:35:03Z",
      "status": "completed",
      "api_response_time": "240ms",
      "result": "Payment authorized successfully. Payment ID: pay_recovered_tx_1001_3"
    }
  ],
  "exceptions": {
    "exception_type": "NetworkTimeout",
    "handled_by": "Exponential backoff retry mechanism",
    "recovery_action": "Scheduled retry attempt 3 after 15min"
  }
}
```

---

### 5. Get Metrics Report
`GET /api/metrics`

**Response (200 OK):**
```json
{
  "batch_id": "batch_20260820_001",
  "generated_at": "2026-08-20T15:00:00Z",
  "input_metrics": {
    "total_failures_detected": 100,
    "total_amount_at_risk": 2572335,
    "avg_failure_amount": 25723.35
  },
  "processing_metrics": {
    "interventions_executed": 100,
    "auto_retries": 45,
    "customer_sms": 35,
    "voice_calls": 10,
    "manual_escalations": 10
  },
  "recovery_metrics": {
    "payments_recovered": 32,
    "amount_recovered": 780000,
    "recovery_rate_percent": 32.0,
    "avg_recovery_per_tx": 24375.0
  },
  "quality_metrics": {
    "interventions_success": 32,
    "interventions_failed": 68,
    "success_rate": 32.0,
    "avg_recovery_time_minutes": 2.3
  },
  "exception_handling": {
    "total_exceptions": 48,
    "gracefully_handled": 48,
    "unhandled": 0,
    "top_exception_type": "network_timeout"
  },
  "compliance": {
    "audit_logs_created": 100,
    "all_actions_tracked": true,
    "escalation_rules_followed": true,
    "gdpr_compliant": true,
    "bounded_workflow_enforced": true
  }
}
```
