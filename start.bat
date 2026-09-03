@echo off
echo ==========================================================
echo Starting PaymentGuard: AI Revenue Recovery Agent
echo Razorpay AI Buildathon (Track 03)
echo ==========================================================

start "PaymentGuard Backend (FastAPI)" cmd /k "python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 >nul

start "PaymentGuard Frontend (Vite React)" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

start http://localhost:5173/

echo Both services started!
echo Frontend: http://localhost:5173/
echo Backend:  http://127.0.0.1:8000/docs
