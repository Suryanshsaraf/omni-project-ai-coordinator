"""Project Scoping & Work Breakdown Structure (WBS) Engine.
Implements the AI CERTs advanced context-rich prompting framework.
"""

import json
import re
from typing import Dict, Any, List
from modules.ai_client import AIClient


SCOPING_SYSTEM_PROMPT = """You are a Principal Agile Project Manager and Certified Scrum Master (PMI-ACP / CPMAI).
Your task is to take an unstructured project requirement brief and transform it into a mathematically coherent, high-velocity Work Breakdown Structure (WBS).

Strict Requirements:
1. Break down into 2-4 major Epics.
2. Under each Epic, create detailed User Stories following the format: 'As a [role], I want [action], so that [business value]'.
3. Every task MUST have Gherkin-style Acceptance Criteria: 'Given [context], When [action], Then [measurable outcome]'.
4. Assign realistic Story Points (Fibonacci: 1, 2, 3, 5, 8, 13) and estimated hours.
5. Identify explicit task dependencies (e.g., Task B depends on Task A).
6. Flag initial Risk Level (Low, Medium, High).
7. Return ONLY valid, unescaped JSON matching the exact schema requested. Do not include markdown code fence formatting outside the JSON if possible."""


class ScopingEngine:
    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    def generate_wbs(self, brief: str, methodology: str = "Agile / Scrum", sprint_weeks: int = 2) -> Dict[str, Any]:
        """Runs the context-rich scoping prompt and parses output into structured WBS data."""
        user_prompt = f"""
Project Requirement Brief:
{brief}

Parameters:
- Methodology: {methodology}
- Sprint Cadence: {sprint_weeks} weeks
- Target: High-quality Production Readiness

Return a JSON object with this exact structure:
{{
  "project_title": "Short punchy title",
  "executive_summary": "1-2 sentence overview of scope and delivery approach",
  "epics": [
    {{
      "id": "EPIC-1",
      "title": "Epic Name",
      "priority": "Urgent|High|Medium|Low",
      "description": "Scope of this epic"
    }}
  ],
  "tasks": [
    {{
      "id": "TASK-101",
      "epic_id": "EPIC-1",
      "title": "Clear Actionable Task Title",
      "user_story": "As a [role], I want [action], so that [benefit]",
      "acceptance_criteria": "Given [context], When [trigger], Then [outcome]",
      "story_points": 5,
      "estimated_hours": 20,
      "priority": "High",
      "dependencies": [],
      "risk_level": "Medium"
    }}
  ]
}}
"""
        response_text = self.ai.generate(user_prompt, system_prompt=SCOPING_SYSTEM_PROMPT, temperature=0.2)
        return self._clean_and_parse_json(response_text)

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        """Cleans AI output removing backticks and comments before parsing."""
        clean = raw_text.strip()
        # Remove ```json and ```
        clean = re.sub(r"^```(?:json)?\s*", "", clean, flags=re.MULTILINE)
        clean = re.sub(r"\s*```$", "", clean, flags=re.MULTILINE)
        
        try:
            return json.loads(clean)
        except Exception:
            # Try to find the outermost JSON object
            match = re.search(r"(\{.*\})", clean, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            # If all fails, return structured fallback
            return json.loads(self.ai._mock_scoping_json(raw_text))
