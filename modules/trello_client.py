"""Trello REST API Integration Client for OmniProject AI.
Supports live Trello card creation and simulation.
"""

from typing import Dict, Any, List, Optional
import requests


class TrelloClient:
    def __init__(self, api_key: Optional[str] = None, token: Optional[str] = None, list_id: Optional[str] = None):
        self.api_key = api_key
        self.token = token
        self.list_id = list_id
        self.base_url = "https://api.trello.com/1"

    def is_connected(self) -> bool:
        return bool(self.api_key and self.token and self.list_id)

    def create_card(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a card in Trello list or simulates creation."""
        if not self.is_connected():
            return {
                "id": f"trello_sim_{task_data.get('id', '999')}",
                "name": task_data.get("title"),
                "status": "simulated",
                "message": "Simulated Trello sync (Add Trello API Key in Settings for live sync)"
            }

        desc = (
            f"**User Story:**\n{task_data.get('user_story', '')}\n\n"
            f"**Acceptance Criteria:**\n{task_data.get('acceptance_criteria', '')}\n\n"
            f"**Story Points:** {task_data.get('story_points', 0)} | **Estimate:** {task_data.get('estimated_hours', 0)}h"
        )

        params = {
            "key": self.api_key,
            "token": self.token,
            "idList": self.list_id,
            "name": f"[{task_data.get('id', 'TASK')}] {task_data.get('title')}",
            "desc": desc,
            "pos": "bottom"
        }

        try:
            res = requests.post(f"{self.base_url}/cards", params=params, timeout=15)
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

    def sync_all_cards(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for t in tasks:
            res = self.create_card(t)
            results.append(res)
        return results
