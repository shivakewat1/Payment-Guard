from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from backend.services.revenue_calculator import RevenueCalculator

router = APIRouter(prefix="/api/revenue", tags=["Revenue Impact"])
calculator = RevenueCalculator()

@router.get("/impact")
async def get_revenue_impact(failures: int = Query(100, ge=10, le=500)):
    """Get revenue impact for given number of daily failures"""
    return calculator.calculate_daily_impact(failures)

@router.get("/monthly")
async def get_monthly_impact(failures: int = Query(100, ge=10, le=500)):
    """Get monthly impact"""
    return calculator.calculate_monthly_impact(failures)

@router.get("/yearly")
async def get_yearly_impact(failures: int = Query(100, ge=10, le=500)):
    """Get yearly impact"""
    return calculator.calculate_yearly_impact(failures)

@router.post("/merchant-impact")
async def get_merchant_impact(data: Dict[str, Any] = Body(...)):
    """Calculate impact for specific merchant"""
    return calculator.calculate_customer_segment_impact(data)

@router.get("/roi")
async def get_roi(failures: int = Query(100, ge=10, le=500)):
    """Get ROI calculation"""
    yearly = calculator.calculate_yearly_impact(failures)
    return calculator.calculate_roi(yearly["yearly_uplift"])

@router.get("/report")
async def get_full_report(failures: int = Query(100, ge=10, le=500)):
    """Generate comprehensive financial report"""
    return calculator.generate_financial_report(failures)
