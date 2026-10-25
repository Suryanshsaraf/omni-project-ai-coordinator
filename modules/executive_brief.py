"""Executive Status Brief & C-Suite Reporting Engine.
Formats high-impact, context-rich project summaries for leadership and stakeholders.
"""

from datetime import datetime
from typing import Dict, Any, List
from modules.ai_client import AIClient


EXECUTIVE_SYSTEM_PROMPT = """You are a Senior Technical Program Manager (TPM) delivering a concise, high-impact Executive Status Brief for executive leadership (VP of Engineering, Head of Product, and C-Suite).

Your writing must be:
- Direct, data-driven, and crisp.
- Free of unnecessary filler words.
- Explicit with RAG status (Red, Amber, Green).
- Clear on management escalations and trade-off decisions."""


class ExecutiveBriefEngine:
    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    def generate_brief(self, project: Dict[str, Any], bottlenecks: List[Dict[str, Any]], risks: List[Dict[str, Any]]) -> str:
        """Synthesizes board metrics, bottlenecks, and risks into an Executive Brief."""
        tasks = project.get("tasks", [])
        total_tasks = len(tasks)
        done_tasks = len([t for t in tasks if t.get("status") == "Done"])
        in_progress = len([t for t in tasks if t.get("status") == "In Progress"])
        blocked_tasks = len([t for t in tasks if t.get("status") == "Blocked"])
        
        total_points = sum(t.get("story_points", 0) for t in tasks)
        done_points = sum(t.get("story_points", 0) for t in tasks if t.get("status") == "Done")
        
        completion_pct = round((done_points / total_points * 100), 1) if total_points > 0 else 0
        
        # Rule-based RAG suggestion
        if blocked_tasks >= 2 or any(r.get("severity") == "Critical" for r in risks):
            rag_status = "RED (Immediate Leadership Action Required)"
        elif blocked_tasks == 1 or completion_pct < 40:
            rag_status = "AMBER (Close Monitoring Required)"
        else:
            rag_status = "GREEN (On Track)"

        user_prompt = f"""
Project: {project.get('title')}
Summary / Goal: {project.get('description')}
Methodology: {project.get('methodology', 'Agile')}

Quantitative Metrics:
- Total Story Points: {total_points}
- Completed Story Points: {done_points} ({completion_pct}%)
- Task Breakdown: {done_tasks} Done, {in_progress} In Progress, {blocked_tasks} Blocked, {total_tasks - done_tasks - in_progress - blocked_tasks} To Do
- Proposed RAG Indicator: {rag_status}

Active Critical Bottlenecks:
{bottlenecks}

Top Critical Risks:
{risks[:3]}

Generate an Executive Status Brief adhering to this format:
1. **Executive Summary & Overall Health (RAG Status)**
2. **Key Milestones Achieved This Sprint**
3. **Critical Blockers & Management Escalations Required** (specify exact decisions needed)
4. **Predictive Delivery Outlook & Next 7-Day Priorities**
"""
        brief_markdown = self.ai.generate(user_prompt, system_prompt=EXECUTIVE_SYSTEM_PROMPT, temperature=0.3)
        return brief_markdown
