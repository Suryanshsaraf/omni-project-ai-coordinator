#!/usr/bin/env bash

# OmniProject AI Coordinator Launch Script
echo "============================================================"
echo "🚀 Starting OmniProject AI: Autonomous Digital Coordinator..."
echo "============================================================"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Launch Streamlit
python3 -m streamlit run app.py --server.port=8501 --server.headless=false
