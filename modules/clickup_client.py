"""ClickUp REST API Integration Client for OmniProject AI.
Supports live ClickUp v2 API task sync and graceful local simulation.
"""

from typing import Dict, Any, List, Optional
import requests


class ClickUpClient:
    def __init__(self, api_token: Optional[str] = None, list_id: Optional[str] = None):
        self.api_token = api_token
        self.list_id = list_id
        self.base_url = "https://api.clickup.com/api/v2"

    def is_connected(self) -> bool:
        return bool(self.api_token and self.list_id)

    def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a single task in ClickUp list or simulates creation."""
        if not self.is_connected():
            return {
                "id": f"cu_sim_{task_data.get('id', '999')}",
                "name": task_data.get("title"),
                "status": "simulated",
                "message": "Simulated sync (Enter ClickUp API Token in Settings for live sync)"
            }

        headers = {
            "Authorization": self.api_token,
            "Content-Type": "application/json"
        }
        
        # Priority mapping: Urgent=1, High=2, Normal/Medium=3, Low=4
        p_map = {"urgent": 1, "high": 2, "medium": 3, "normal": 3, "low": 4}
        priority = p_map.get(task_data.get("priority", "medium").lower(), 3)

        payload = {
            "name": f"[{task_data.get('id', 'TASK')}] {task_data.get('title')}",
            "description": f"**User Story:**\n{task_data.get('user_story', '')}\n\n**Acceptance Criteria (Gherkin):**\n{task_data.get('acceptance_criteria', '')}\n\n**Estimated Hours:** {task_data.get('estimated_hours', 0)}h",
            "priority": priority,
            "tags": [task_data.get("epic_id", "General"), "AI-Generated"]
        }

        try:
            res = requests.post(
                f"{self.base_url}/list/{self.list_id}/task",
                headers=headers,
                json=payload,
                timeout=15
            )
            res.raise_for_status()
            data = res.json()
            return {
                "id": data.get("id"),
                "name": data.get("name"),
                "url": data.get("url"),
                "status": "success"
            }
        except Exception as e:
            return {
                "id": f"err_{task_data.get('id')}",
                "name": task_data.get("title"),
                "status": "error",
                "error": str(e)
            }

    def sync_all_tasks(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Syncs an entire WBS backlog into ClickUp."""
        results = []
        for t in tasks:
            res = self.create_task(t)
            results.append(res)
        return results
