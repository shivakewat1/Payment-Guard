import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.services.revenue_calculator import RevenueCalculator

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_revenue_calculator_unit():
    calc = RevenueCalculator()
    
    # 100 failures
    daily = calc.calculate_daily_impact(100)
    assert daily["failures_detected"] == 100
    assert daily["industry_benchmark"]["recovery_count"] == 25
    assert daily["paymentguard"]["recovery_count"] == 56
    assert daily["uplift"]["additional_recoveries"] == 31
    assert daily["uplift"]["revenue_saved"] == 310000  # 31 * 10,000 = 3,10,000
    
    monthly = calc.calculate_monthly_impact(100)
    assert monthly["monthly_uplift"] == 310000 * 30  # 93,00,000
    
    yearly = calc.calculate_yearly_impact(100)
    assert yearly["yearly_uplift"] == 310000 * 365  # 11,31,50,000

    roi = calc.calculate_roi(yearly["yearly_uplift"])
    assert roi["annual_system_cost"] == 1000000
    assert roi["net_benefit"] > 0
    assert "roi_percent" in roi

    payback = calc.calculate_payback_period()
    assert "payback_days" in payback
    assert "status" in payback

def test_revenue_api_endpoints(client):
    # Test GET /api/revenue/impact
    res = client.get("/api/revenue/impact?failures=100")
    assert res.status_code == 200
    data = res.json()
    assert data["failures_detected"] == 100
    assert "industry_benchmark" in data
    assert "paymentguard" in data
    assert "uplift" in data

    # Test GET /api/revenue/monthly
    res_monthly = client.get("/api/revenue/monthly?failures=100")
    assert res_monthly.status_code == 200
    data_monthly = res_monthly.json()
    assert data_monthly["period"] == "monthly"
    assert data_monthly["monthly_uplift"] > 0

    # Test GET /api/revenue/yearly
    res_yearly = client.get("/api/revenue/yearly?failures=100")
    assert res_yearly.status_code == 200
    data_yearly = res_yearly.json()
    assert data_yearly["period"] == "yearly"
    assert data_yearly["yearly_uplift"] > 0

    # Test GET /api/revenue/roi
    res_roi = client.get("/api/revenue/roi?failures=100")
    assert res_roi.status_code == 200
    data_roi = res_roi.json()
    assert "roi_percent" in data_roi
    assert "net_benefit" in data_roi

    # Test POST /api/revenue/merchant-impact
    res_merchant = client.post("/api/revenue/merchant-impact", json={
        "name": "Custom Store",
        "daily_failures": 50,
        "avg_transaction": 15000,
        "current_recovery_rate": 0.30
    })
    assert res_merchant.status_code == 200
    data_m = res_merchant.json()
    assert data_m["merchant"] == "Custom Store"
    assert data_m["daily_failures"] == 50
    assert "impact" in data_m
