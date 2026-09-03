# PaymentGuard: Deployment & Run Guide

This guide details how to run PaymentGuard locally or deploy with Docker Compose.

---

## Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** v18+ (tested on Node v23)
- **Database:** SQLite (default zero-config) or PostgreSQL 15+

---

## Option 1: Quickstart Local Development (Recommended)

### 1. Backend Setup
1. Open a terminal in the root directory:
```bash
# Optional: create virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

2. Configure environment (optional, defaults run in offline simulation mode):
```bash
cp .env.example .env
```

3. Start FastAPI backend server:
```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```
API server will be available at: `http://localhost:8000`  
Swagger Interactive Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
1. In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will run at: `http://localhost:5173`

---

## Option 2: Docker Compose (Full Stack with PostgreSQL)

1. Ensure Docker Desktop is running.
2. Build and launch all services:
```bash
docker-compose up --build
```
This starts:
- **PostgreSQL 15** on port 5432
- **FastAPI Backend** on port 8000
- **React Dashboard** on port 5173

---

## Running the Automated Test Suite

Run pytest with detailed verbose output and coverage:
```bash
pytest tests/ -v
```

All 14 unit and integration tests validate the 4 agent steps, bounded rules, graceful failure handling, and batch metrics.
