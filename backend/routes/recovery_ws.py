"""
Real-time recovery progress via WebSocket
No external services, completely FREE!
"""

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import List
import asyncio
import json
from datetime import datetime
import logging

from backend.database.db import SessionLocal
from backend.database.models import Failure
from backend.agents.detector import FailureDetector
from backend.agents.diagnosis import DiagnosisAgent
from backend.agents.intervention import InterventionEngine
from backend.agents.executor import RecoveryExecutor

router = APIRouter()
logger = logging.getLogger(__name__)

class RecoveryManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"✅ Client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}")

manager = RecoveryManager()

detector = FailureDetector()
diagnostician = DiagnosisAgent()
decider = InterventionEngine()
executor = RecoveryExecutor()

@router.websocket("/ws/recovery")
async def websocket_recovery(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "start_recovery":
                db = SessionLocal()
                try:
                    # Sync & detect failures in DB
                    detector.sync_and_detect(db=db)
                    failures = db.query(Failure).all()
                    total = len(failures)
                    
                    # Send start message
                    await manager.broadcast({
                        "type": "started",
                        "total": total,
                        "message": f"Starting recovery pipeline for {total} transactions..."
                    })
                    
                    completed = 0
                    total_recovered_count = 0
                    total_amount = 0.0
                    
                    # Process each failure with agentic recovery loop
                    for idx, failure in enumerate(failures):
                        try:
                            # 1. Diagnose
                            diagnosis = diagnostician.diagnose(db, failure.tx_id)
                            
                            # 2. Intervene
                            intervention = decider.decide_intervention(db, failure.tx_id)
                            
                            # 3. Execute
                            result = executor.execute_intervention(db, intervention["intervention_id"])
                            
                            # Track results
                            if result.get("status") == "success":
                                total_recovered_count += 1
                                money = result.get("money_recovered", 0.0)
                                total_amount += money
                            
                            completed += 1
                            rate = (total_recovered_count / completed) * 100.0 if completed > 0 else 0.0
                            
                            # Send progress update
                            await manager.broadcast({
                                "type": "progress",
                                "completed": completed,
                                "total": total,
                                "percentage": (completed / total) * 100.0,
                                "recovered": total_recovered_count,
                                "amount": f"₹{total_amount:,.2f}",
                                "rate": round(rate, 1),
                                "current_tx": failure.tx_id
                            })
                            
                            await asyncio.sleep(0.15)  # Smooth real-time animation pulse
                        
                        except Exception as e:
                            logger.error(f"Error processing transaction {failure.tx_id}: {e}")
                            completed += 1
                            continue
                    
                    final_rate = (total_recovered_count / total) * 100.0 if total > 0 else 0.0
                    
                    # Send completion message
                    await manager.broadcast({
                        "type": "complete",
                        "completed": completed,
                        "total": total,
                        "recovered": total_recovered_count,
                        "amount": f"₹{total_amount:,.2f}",
                        "rate": round(final_rate, 1),
                        "message": f"✅ Complete! {completed}/{total} transactions processed seamlessly."
                    })
                finally:
                    db.close()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from /ws/recovery")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
