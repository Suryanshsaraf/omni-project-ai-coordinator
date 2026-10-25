"""Dynamic Risk Register & Probability x Impact Matrix Engine.
Implements predictive analytics to flag bottleneck risks and map mitigations.
"""

import json
import re
from typing import List, Dict, Any
from modules.ai_client import AIClient


RISK_SYSTEM_PROMPT = """You are an Enterprise Risk Management & PMO Governance Specialist.
Analyze the project tasks, critical paths, and dependencies to synthesize a rigorous Dynamic Risk Log.

For every identified risk:
1. Assign Probability (1 to 5, where 5 is almost certain).
2. Assign Impact (1 to 5, where 5 is project catastrophic failure).
3. Compute Score = Probability * Impact (1-25).
4. Severity:
   - 16-25: Critical (Red)
   - 12-15: High (Orange)
   - 6-11: Moderate (Yellow)
   - 1-5: Low (Green)
5. Provide a specific, actionable Mitigation Strategy (not vague advice) and an Assigned Owner.
6. Output ONLY a valid JSON array of risk objects."""


class RiskEngine:
    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    def analyze_risks(self, project_title: str, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Takes project tasks and generates a scored risk register."""
        task_summary = []
        for t in tasks:
            task_summary.append({
                "id": t.get("id"),
                "title": t.get("title"),
                "status": t.get("status"),
                "dependencies": t.get("dependencies", []),
                "priority": t.get("priority"),
                "blocker": t.get("blocker_reason", None)
            })

        user_prompt = f"""
Project: {project_title}
Active Tasks & Dependency Graph:
{json.dumps(task_summary, indent=2)}

Synthesize 3-5 comprehensive risks covering:
1. Technical & Infrastructure dependencies
2. Resource bottlenecks / single points of failure
3. Schedule compression & critical path delays
4. Compliance, Security, or External Vendor blockers

Return JSON Array format:
[
  {{
    "id": "RISK-01",
    "category": "Technical|Resource|Schedule|Compliance",
    "description": "Clear risk explanation",
    "probability": 4,
    "impact": 5,
    "score": 20,
    "severity": "Critical|High|Moderate|Low",
    "mitigation_strategy": "Concrete mitigation action",
    "owner": "Role or Person name",
    "status": "Active"
  }}
]
"""
        response_text = self.ai.generate(user_prompt, system_prompt=RISK_SYSTEM_PROMPT, temperature=0.2)
        return self._clean_and_parse_risks(response_text)

    def compute_bottlenecks(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predictive algorithmic scan of tasks to detect bottlenecks."""
        bottlenecks = []
        task_map = {t["id"]: t for t in tasks}

        for t in tasks:
            is_blocked = t.get("status") == "Blocked"
            
            # Check how many other tasks depend on this task
            dependent_tasks = [other["id"] for other in tasks if t["id"] in other.get("dependencies", [])]
            
            # Severe bottleneck: blocked task that blocks downstream tasks
            if is_blocked:
                bottlenecks.append({
                    "task_id": t["id"],
                    "title": t["title"],
                    "assignee": t.get("assignee", "Unassigned"),
                    "type": "Active Blocker",
                    "severity": "Critical" if len(dependent_tasks) > 0 else "High",
                    "impact_summary": f"Directly blocks {len(dependent_tasks)} downstream tasks: {', '.join(dependent_tasks) if dependent_tasks else 'None'}",
                    "blocker_reason": t.get("blocker_reason", "No blocker note provided by assignee.")
                })
            elif len(dependent_tasks) >= 2 and t.get("status") == "To Do":
                bottlenecks.append({
                    "task_id": t["id"],
                    "title": t["title"],
                    "assignee": t.get("assignee", "Unassigned"),
                    "type": "Critical Path Lag",
                    "severity": "Medium",
                    "impact_summary": f"High dependency node. {len(dependent_tasks)} tasks waiting for this to start.",
                    "blocker_reason": "Task not started yet despite multiple dependents."
                })

        return bottlenecks

    def _clean_and_parse_risks(self, raw_text: str) -> List[Dict[str, Any]]:
        clean = raw_text.strip()
        clean = re.sub(r"^```(?:json)?\s*", "", clean, flags=re.MULTILINE)
        clean = re.sub(r"\s*```$", "", clean, flags=re.MULTILINE)
        
        try:
            parsed = json.loads(clean)
            if isinstance(parsed, list):
                return parsed
            elif isinstance(parsed, dict) and "risks" in parsed:
                return parsed["risks"]
        except Exception:
            match = re.search(r"(\[.*\])", clean, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
        return json.loads(self.ai._mock_risk_json(raw_text))
