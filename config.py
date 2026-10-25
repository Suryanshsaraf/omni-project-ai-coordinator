"""Configuration and constants for OmniProject AI Coordinator."""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SAMPLE_PROJECTS_FILE = DATA_DIR / "sample_projects.json"

APP_TITLE = "OmniProject AI: Autonomous Digital Project Coordinator"
APP_SUBTITLE = "AI-Driven Work Breakdown, Dynamic Risk Matrices, and Autonomous Scrum Coordination"

def load_sample_projects():
    if SAMPLE_PROJECTS_FILE.exists():
        with open(SAMPLE_PROJECTS_FILE, "r") as f:
            return json.load(f)
    return {}
