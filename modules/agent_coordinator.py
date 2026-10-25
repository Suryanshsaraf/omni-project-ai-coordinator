"""Autonomous Digital Project Coordinator (Virtual AI Agent).
Implements automated rules, capacity balancing, and intelligent coordinator actions.
"""

from datetime import datetime
from typing import Dict, Any, List


class DigitalProjectCoordinatorAgent:
    def __init__(self):
        self.action_logs = []

    def log_action(self, action_type: str, message: str):
        self.action_logs.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "type": action_type,
            "message": message
        })

    def audit_project(self, project: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the complete Virtual AI Coordinator inspection cycle."""
        tasks = project.get("tasks", [])
        team_members = project.get("team_members", [])

        # 1. Workload Optimization (Wrike-style balancing)
        workload_analysis = self._analyze_workload(tasks, team_members)

        # 2. Quality & Acceptance Criteria Audit
        quality_audit = self._audit_task_quality(tasks)

        # 3. Blocker & Stalled Task Nudges
        nudges = self._generate_nudges(tasks)

        # 4. Generate Agent Insights
        agent_actions = []
        for w in workload_analysis["overloaded"]:
            act = f"Alerted PM: {w['name']} is allocated {w['allocated_hours']}h / {w['capacity_hours']}h capacity ({w['load_pct']}%). Reallocation recommended."
            agent_actions.append({"level": "Warning", "action": act})
            self.log_action("WORKLOAD_ALERT", act)

        for q in quality_audit["missing_criteria"]:
            act = f"Flagged Task '{q['title']}': Missing Given-When-Then acceptance criteria."
            agent_actions.append({"level": "Info", "action": act})
            self.log_action("QUALITY_FLAG", act)

        for n in nudges:
            act = f"Drafted unblock nudge for {n['assignee']} regarding '{n['task_title']}'."
            agent_actions.append({"level": "Urgent", "action": act})
            self.log_action("NUDGE_GENERATED", act)

        return {
            "workload": workload_analysis,
            "quality": quality_audit,
            "nudges": nudges,
            "agent_actions": agent_actions,
            "health_score": self._calculate_health_score(tasks, workload_analysis)
        }

    def _analyze_workload(self, tasks: List[Dict[str, Any]], team_members: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates workload vs capacity per member."""
        member_stats = {m["name"]: {"role": m.get("role", "Engineer"), "capacity_hours": m.get("capacity_hours", 40), "allocated_hours": 0, "task_count": 0} for m in team_members}
        
        # In case tasks have assignees not in team_members list
        for t in tasks:
            assignee = t.get("assignee")
            hours = t.get("estimated_hours", 0)
            if assignee:
                if assignee not in member_stats:
                    member_stats[assignee] = {"role": "Contributor", "capacity_hours": 40, "allocated_hours": 0, "task_count": 0}
                # Count hours for tasks not done
                if t.get("status") != "Done":
                    member_stats[assignee]["allocated_hours"] += hours
                    member_stats[assignee]["task_count"] += 1

        overloaded = []
        underutilized = []
        balanced = []

        for name, data in member_stats.items():
            cap = data["capacity_hours"]
            alloc = data["allocated_hours"]
            load_pct = round((alloc / cap * 100), 1) if cap > 0 else 0
            record = {
                "name": name,
                "role": data["role"],
                "capacity_hours": cap,
                "allocated_hours": alloc,
                "load_pct": load_pct,
                "task_count": data["task_count"]
            }
            if load_pct > 100:
                overloaded.append(record)
            elif load_pct < 45 and data["task_count"] > 0:
                underutilized.append(record)
            else:
                balanced.append(record)

        return {
            "all": list(member_stats.values()),
            "stats_table": [
                {"Member": name, "Role": d["role"], "Capacity (h)": d["capacity_hours"], "Active Hours (h)": d["allocated_hours"], "Load %": f"{round((d['allocated_hours']/d['capacity_hours']*100), 1)}%"}
                for name, d in member_stats.items()
            ],
            "overloaded": overloaded,
            "underutilized": underutilized,
            "balanced": balanced
        }

    def _audit_task_quality(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        missing_criteria = []
        valid_criteria = []
        
        for t in tasks:
            ac = t.get("acceptance_criteria", "")
            has_given = "given" in ac.lower()
            has_when = "when" in ac.lower()
            has_then = "then" in ac.lower()
            
            if not (has_given and has_when and has_then):
                missing_criteria.append({
                    "id": t.get("id"),
                    "title": t.get("title"),
                    "assignee": t.get("assignee", "Unassigned")
                })
            else:
                valid_criteria.append(t.get("id"))

        return {
            "missing_criteria": missing_criteria,
            "valid_count": len(valid_criteria),
            "total_count": len(tasks),
            "compliance_pct": round((len(valid_criteria) / len(tasks) * 100), 1) if tasks else 100
        }

    def _generate_nudges(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        nudges = []
        for t in tasks:
            if t.get("status") == "Blocked":
                assignee = t.get("assignee", "Team")
                title = t.get("title")
                reason = t.get("blocker_reason", "dependency wait")
                
                # Context-rich nudge message
                message = f"Hi {assignee.split()[0]}! 🤖 OmniProject AI Coordinator noticed that '{title}' is currently marked Blocked ({reason}). Would you like me to ping the dependency owner or escalate this during today's standup?"
                
                nudges.append({
                    "task_id": t.get("id"),
                    "task_title": title,
                    "assignee": assignee,
                    "blocker_reason": reason,
                    "nudge_message": message
                })
        return nudges

    def _calculate_health_score(self, tasks: List[Dict[str, Any]], workload: Dict[str, Any]) -> int:
        """Calculates 0-100 overall project execution health."""
        if not tasks:
            return 100
        score = 100
        
        # Penalize blocked tasks (-12 per blocked task)
        blocked_count = len([t for t in tasks if t.get("status") == "Blocked"])
        score -= (blocked_count * 12)
        
        # Penalize overloaded team members (-10 per overloaded member)
        score -= (len(workload["overloaded"]) * 10)
        
        # Cap score between 10 and 100
        return max(15, min(100, score))
