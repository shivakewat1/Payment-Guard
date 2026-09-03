import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from .db import Base

def generate_uuid():
    return str(uuid.uuid4())

class Failure(Base):
    __tablename__ = "failures"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tx_id = Column(String(64), unique=True, index=True, nullable=False)
    merchant_id = Column(String(64), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="INR", nullable=False)
    reason = Column(String(128), nullable=False)
    reason_description = Column(Text, nullable=True)
    failure_category = Column(String(32), default="network") # network/issuer/merchant/customer
    customer_id = Column(String(64), index=True, nullable=True)
    customer_name = Column(String(128), nullable=True)
    customer_email = Column(String(128), nullable=True)
    customer_phone = Column(String(32), nullable=True)
    risk_score = Column(Integer, default=50) # 0-100
    status = Column(String(32), default="detected") # detected/processing/recovered/failed
    attempts = Column(Integer, default=1)
    last_attempt = Column(DateTime, default=datetime.utcnow)
    customer_history = Column(JSON, nullable=True)
    merchant_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    failure_id = Column(String(64), index=True, nullable=False) # References tx_id
    root_cause = Column(String(128), nullable=False)
    cause_category = Column(String(32), nullable=False) # network/issuer/merchant/customer
    severity = Column(String(16), nullable=False) # low/medium/high
    recovery_probability = Column(Integer, nullable=False) # 0-100
    confidence = Column(Integer, nullable=False) # 0-100
    recommended_action = Column(String(64), nullable=False) # retry/contact_customer/escalate
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(64), unique=True, index=True, nullable=False)
    failure_id = Column(String(64), index=True, nullable=False) # References tx_id
    action = Column(String(64), nullable=False) # AUTO_RETRY/CUSTOMER_SMS/VOICE_CALL/MANUAL_ESCALATION
    parameters = Column(JSON, nullable=True)
    risk_level = Column(String(16), default="low") # low/medium/high
    stopping_rules = Column(JSON, nullable=True)
    status = Column(String(32), default="pending") # pending/executing/completed/failed
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    execution_id = Column(String(64), unique=True, index=True, nullable=False)
    failure_id = Column(String(64), index=True, nullable=False) # tx_id
    intervention_id = Column(String(64), index=True, nullable=True)
    action = Column(String(64), nullable=False)
    status = Column(String(32), default="pending") # pending/success/failed
    money_recovered = Column(Float, default=0.0)
    steps = Column(JSON, default=list) # Array of step dictionaries
    exceptions = Column(JSON, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    created_by = Column(String(64), default="PaymentGuard-Agent")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
