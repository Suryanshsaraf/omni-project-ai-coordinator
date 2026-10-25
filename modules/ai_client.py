"""Unified AI Client for OmniProject AI Coordinator.
Supports Google Gemini API, OpenAI API, and an offline smart fallback generator.
"""

import json
import os
import re
from typing import Dict, Any, Optional
import requests


class AIClient:
    def __init__(self, provider: str = "gemini", api_key: Optional[str] = None, model: Optional[str] = None):
        self.provider = provider.lower()
        self.api_key = api_key or os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.model = model or ("gemini-1.5-pro" if "gemini" in self.provider else "gpt-4o")

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.3) -> str:
        """Generates AI completion using configured provider or falls back gracefully."""
        if not self.api_key:
            return self._fallback_generate(prompt)

        try:
            if "gemini" in self.provider or "google" in self.provider:
                return self._call_gemini(prompt, system_prompt, temperature)
            elif "openai" in self.provider:
                return self._call_openai(prompt, system_prompt, temperature)
            else:
                return self._fallback_generate(prompt)
        except Exception as e:
            # Fallback on API rate-limit or network failure
            print(f"[AIClient] Warning: API call failed ({e}). Using smart heuristic fallback.")
            return self._fallback_generate(prompt)

    def _call_gemini(self, prompt: str, system_prompt: Optional[str], temperature: float) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION:\n{system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will follow all instructions strictly."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 3000,
            }
        }
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        data = res.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts:
                return parts[0].get("text", "")
        return self._fallback_generate(prompt)

    def _call_openai(self, prompt: str, system_prompt: Optional[str], temperature: float) -> str:
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=self.model or "gpt-4o",
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content or ""

    def _fallback_generate(self, prompt: str) -> str:
        """Smart domain-aware fallback when no API key is provided."""
        lower = prompt.lower()
        if "scoping" in lower or "wbs" in lower or "breakdown" in lower or "user stories" in lower:
            return self._mock_scoping_json(prompt)
        elif "risk" in lower or "probability" in lower:
            return self._mock_risk_json(prompt)
        elif "executive" in lower or "status report" in lower or "brief" in lower:
            return self._mock_executive_brief_markdown(prompt)
        else:
            return "Generated response based on context requirements."

    def _mock_scoping_json(self, prompt: str) -> str:
        return json.dumps({
            "epics": [
                {
                    "id": "EPIC-10",
                    "title": "Core Architecture & Data Security Foundation",
                    "priority": "High",
                    "description": "Establish base schema, authentication guardrails, and role-based permissions."
                },
                {
                    "id": "EPIC-20",
                    "title": "Primary User Workflow & Business Logic",
                    "priority": "Urgent",
                    "description": "Core features handling transactions, processing rules, and real-time state sync."
                },
                {
                    "id": "EPIC-30",
                    "title": "Analytics, Auditing & Executive Dashboard",
                    "priority": "Medium",
                    "description": "Reporting pipeline, KPI tracking, and automated alerting system."
                }
            ],
            "tasks": [
                {
                    "id": "TASK-1001",
                    "epic_id": "EPIC-10",
                    "title": "Set up Database Schemas & OAuth 2.0 Auth Server",
                    "user_story": "As an engineer, I want central OAuth 2.0 with JWT verification so user identities are validated at the API gateway.",
                    "acceptance_criteria": "Given invalid token, When request arrives, Then gateway rejects with 401 Unauthorized within 10ms.",
                    "assignee": "Lead Architect",
                    "status": "To Do",
                    "story_points": 5,
                    "estimated_hours": 20,
                    "actual_hours": 0,
                    "priority": "Urgent",
                    "dependencies": [],
                    "risk_level": "Medium"
                },
                {
                    "id": "TASK-1002",
                    "epic_id": "EPIC-20",
                    "title": "Interactive Client Dashboard & State Sync",
                    "user_story": "As an end user, I want instant updates on activity status without refreshing so I stay synchronized.",
                    "acceptance_criteria": "Given active session, When status changes, Then WebSocket event pushes payload and renders in < 500ms.",
                    "assignee": "Frontend Lead",
                    "status": "To Do",
                    "story_points": 8,
                    "estimated_hours": 32,
                    "actual_hours": 0,
                    "priority": "High",
                    "dependencies": ["TASK-1001"],
                    "risk_level": "High"
                },
                {
                    "id": "TASK-1003",
                    "epic_id": "EPIC-20",
                    "title": "Third-Party Integration & Webhook Ingestion Engine",
                    "user_story": "As an operations manager, I want automated event ingestion from upstream partners with retry queues.",
                    "acceptance_criteria": "Given partner webhook fails, When backoff policy triggers, Then 3 retries occur with exponential delay before Dead Letter Queue.",
                    "assignee": "Backend Engineer",
                    "status": "To Do",
                    "story_points": 5,
                    "estimated_hours": 24,
                    "actual_hours": 0,
                    "priority": "Medium",
                    "dependencies": ["TASK-1001"],
                    "risk_level": "Medium"
                },
                {
                    "id": "TASK-1004",
                    "epic_id": "EPIC-30",
                    "title": "Automated KPI Reporting & PDF/CSV Export",
                    "user_story": "As an executive, I want scheduled sprint progress reports emailed weekly so I have visibility into velocity.",
                    "acceptance_criteria": "Given scheduled Monday 8:00 AM cron, When report runs, Then PDF is generated and delivered to executive list.",
                    "assignee": "Data Engineer",
                    "status": "To Do",
                    "story_points": 3,
                    "estimated_hours": 14,
                    "actual_hours": 0,
                    "priority": "Low",
                    "dependencies": ["TASK-1002"],
                    "risk_level": "Low"
                }
            ]
        }, indent=2)

    def _mock_risk_json(self, prompt: str) -> str:
        return json.dumps([
            {
                "id": "RSK-01",
                "category": "Architectural / Performance",
                "description": "High latency on third-party webhook dependencies could breach SLA during peak load.",
                "probability": 4,
                "impact": 4,
                "score": 16,
                "severity": "High",
                "mitigation_strategy": "Introduce an asynchronous Celery/Redis queue with circuit breaker pattern to prevent cascade failure.",
                "owner": "Backend Lead",
                "status": "Active"
            },
            {
                "id": "RSK-02",
                "category": "Scope & Timeline",
                "description": "Underestimated complexity of cross-platform state sync may delay Sprint 2 release.",
                "probability": 3,
                "impact": 4,
                "score": 12,
                "severity": "Medium",
                "mitigation_strategy": "Descaffold complex animations and prioritize basic polling fallback before full WebSocket rollout.",
                "owner": "Frontend Lead",
                "status": "Monitoring"
            },
            {
                "id": "RSK-03",
                "category": "Security & Governance",
                "description": "PII data leakage in application debug logs prior to external penetration testing.",
                "probability": 2,
                "impact": 5,
                "score": 10,
                "severity": "Moderate",
                "mitigation_strategy": "Deploy regex log-masking filter in logstash pipeline and enforce OWASP ASVS compliance scan.",
                "owner": "Security Specialist",
                "status": "Active"
            }
        ], indent=2)

    def _mock_executive_brief_markdown(self, prompt: str) -> str:
        return """# 📈 Executive Project Health Brief

**Status:** 🟡 **AMBER (Requires Management Intervention)**  
**Target Milestone:** Sprint 2 Review  
**Calculated Sprint Completion:** 68% (Projected delay: ~2.5 days on critical path)

---

### 1. Key Accomplishments This Sprint
* ✅ **MFA & Core Authentication Completed:** Zero security vulnerabilities reported in static code analysis.
* ✅ **Database Schema Migration Finalized:** Read replicas configured on AWS RDS.
* ✅ **Sprint Backlog Refinement Completed:** 100% of user stories have Gherkin acceptance criteria defined.

### 2. Critical Blockers & Bottlenecks
* 🚨 **WebRTC Infrastructure Clearance:** Dependent on external infrastructure approval. Turnaround time has exceeded 48 hours, blocking video stream testing.
* ⚠️ **Resource Over-allocation:** 1 Senior Fullstack Engineer currently holds 58% of active sprint story points.

### 3. Immediate Action Plan & Mitigation
1. **Unblock DevOps Approval:** Escalate STUN/TURN server firewall ticket with VP of Engineering today by 5 PM.
2. **Workload Balancing:** Reassign Task-105 UI components to Frontend team to recover 14 hours of engineer bandwidth.
3. **Scope Buffer:** Maintain non-critical export features as stretch goals for Sprint 3.

---
*Report auto-generated by OmniProject AI Coordinator at {timestamp}*
"""
