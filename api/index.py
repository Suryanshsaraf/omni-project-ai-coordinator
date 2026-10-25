"""FastAPI Serverless Application for Vercel Deployment.
Exposes endpoints for Scoping, Risk Matrix, Executive Briefs, and AI Coordinator actions.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from config import load_sample_projects
from modules.ai_client import AIClient
from modules.scoping_engine import ScopingEngine
from modules.risk_engine import RiskEngine
from modules.executive_brief import ExecutiveBriefEngine
from modules.agent_coordinator import DigitalProjectCoordinatorAgent
from modules.clickup_client import ClickUpClient
from modules.trello_client import TrelloClient

app = FastAPI(title="OmniProject AI Coordinator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory coordinator agent instance
coordinator_agent = DigitalProjectCoordinatorAgent()

class ScopingRequest(BaseModel):
    brief: str
    methodology: str = "Agile / Scrum"
    sprint_weeks: int = 2
    api_key: Optional[str] = None
    provider: str = "gemini"

class RiskRequest(BaseModel):
    project_title: str
    tasks: List[Dict[str, Any]]
    api_key: Optional[str] = None
    provider: str = "gemini"

class ExecutiveBriefRequest(BaseModel):
    project: Dict[str, Any]
    bottlenecks: List[Dict[str, Any]] = []
    risks: List[Dict[str, Any]] = []
    api_key: Optional[str] = None
    provider: str = "gemini"

class AgentAuditRequest(BaseModel):
    project: Dict[str, Any]

class SyncRequest(BaseModel):
    tasks: List[Dict[str, Any]]
    api_token: Optional[str] = None
    list_id: Optional[str] = None
    trello_key: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "OmniProject AI Coordinator (Vercel Serverless)"}

@app.get("/api/projects")
def get_sample_projects():
    data = load_sample_projects()
    return data

@app.post("/api/scoping")
def generate_scoping(req: ScopingRequest):
    ai = AIClient(provider=req.provider, api_key=req.api_key)
    engine = ScopingEngine(ai)
    try:
        wbs = engine.generate_wbs(req.brief, methodology=req.methodology, sprint_weeks=req.sprint_weeks)
        return wbs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/risks")
def analyze_risks(req: RiskRequest):
    ai = AIClient(provider=req.provider, api_key=req.api_key)
    engine = RiskEngine(ai)
    try:
        risks = engine.analyze_risks(req.project_title, req.tasks)
        bottlenecks = engine.compute_bottlenecks(req.tasks)
        return {"risks": risks, "bottlenecks": bottlenecks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/executive-brief")
def generate_executive_brief(req: ExecutiveBriefRequest):
    ai = AIClient(provider=req.provider, api_key=req.api_key)
    engine = ExecutiveBriefEngine(ai)
    try:
        brief = engine.generate_brief(req.project, req.bottlenecks, req.risks)
        return {"brief_markdown": brief}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent-audit")
def audit_project(req: AgentAuditRequest):
    try:
        report = coordinator_agent.audit_project(req.project)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync-clickup")
def sync_clickup(req: SyncRequest):
    client = ClickUpClient(api_token=req.api_token, list_id=req.list_id)
    results = client.sync_all_tasks(req.tasks)
    return {"synced_count": len(results), "details": results, "mode": "live" if client.is_connected() else "simulated"}

@app.post("/api/sync-trello")
def sync_trello(req: SyncRequest):
    client = TrelloClient(api_key=req.trello_key, token=req.api_token, list_id=req.list_id)
    results = client.sync_all_cards(req.tasks)
    return {"synced_count": len(results), "details": results, "mode": "live" if client.is_connected() else "simulated"}
