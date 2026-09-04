# Routes module
from .detect import router as detect_router
from .diagnose import router as diagnose_router
from .intervene import router as intervene_router
from .execute import router as execute_router
from .metrics import router as metrics_router
from .audit import router as audit_router
from .batch import router as batch_router
from .recovery_ws import router as recovery_ws_router
from .revenue import router as revenue_router

__all__ = [
    "detect_router",
    "diagnose_router",
    "intervene_router",
    "execute_router",
    "metrics_router",
    "audit_router",
    "batch_router",
    "recovery_ws_router",
    "revenue_router"
]

