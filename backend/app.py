import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database.db import engine, Base, SessionLocal
from backend.routes import (
    detect_router,
    diagnose_router,
    intervene_router,
    execute_router,
    metrics_router,
    audit_router,
    batch_router,
    recovery_ws_router
)
from backend.agents.detector import FailureDetector
from backend.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created
    logger.info("Initializing PaymentGuard Database Schema...")
    Base.metadata.create_all(bind=engine)

    # Initial automatic seeding of 100 synthetic transactions if empty
    db = SessionLocal()
    try:
        from backend.database.models import Failure
        count = db.query(Failure).count()
        if count == 0:
            logger.info("No existing failure records found. Pre-seeding 100 synthetic failures...")
            detector = FailureDetector()
            detector.sync_and_detect(db=db)
            logger.info("Seeding complete. Ready for Buildathon evaluation.")
        else:
            logger.info(f"Database contains {count} existing failure records.")
    except Exception as e:
        logger.error(f"Error during startup data seeding: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down PaymentGuard API server.")

app = FastAPI(
    title="PaymentGuard - AI Revenue Recovery Agent",
    description="Autonomous, bounded AI payment failure recovery workflow for Razorpay AI Buildathon Track 03.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(detect_router)
app.include_router(diagnose_router)
app.include_router(intervene_router)
app.include_router(execute_router)
app.include_router(metrics_router)
app.include_router(audit_router)
app.include_router(batch_router)
app.include_router(recovery_ws_router)

@app.get("/")
def root():
    return {
        "project": "PaymentGuard",
        "description": "AI Revenue Recovery Agent",
        "track": "Track 03 - AI Revenue Recovery",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "claude_integration": "active" if settings.ANTHROPIC_API_KEY else "fallback_engine_active",
        "razorpay_mode": "live_keys" if not settings.RAZORPAY_KEY_ID.startswith("rzp_test_mock") else "sandbox_simulation",
        "bounded_rules": {
            "max_retries": settings.MAX_RETRIES,
            "max_amount_auto_retry": settings.MAX_AMOUNT_AUTO_RETRY,
            "circuit_breaker": settings.CIRCUIT_BREAKER_THRESHOLD
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
