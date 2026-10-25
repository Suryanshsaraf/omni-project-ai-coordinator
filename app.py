"""OmniProject AI: Autonomous Digital Project Coordinator.
Built for AI-Augmented Project Management based on AI CERTs course tools.
"""

import json
from datetime import datetime
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from config import load_sample_projects, APP_TITLE, APP_SUBTITLE
from modules.ai_client import AIClient
from modules.scoping_engine import ScopingEngine, SCOPING_SYSTEM_PROMPT
from modules.risk_engine import RiskEngine, RISK_SYSTEM_PROMPT
from modules.executive_brief import ExecutiveBriefEngine, EXECUTIVE_SYSTEM_PROMPT
from modules.agent_coordinator import DigitalProjectCoordinatorAgent
from modules.clickup_client import ClickUpClient
from modules.trello_client import TrelloClient

# --- Page Configuration ---
st.set_page_config(
    page_title="OmniProject AI Coordinator",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom Styling ---
st.markdown("""
<style>
    .metric-card {
        background-color: #1e222d;
        border-radius: 10px;
        padding: 16px;
        border: 1px solid #2e3444;
        margin-bottom: 12px;
    }
    .badge-urgent { background-color: #e63946; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;}
    .badge-high { background-color: #f4a261; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;}
    .badge-medium { background-color: #2a9d8f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;}
    .badge-low { background-color: #457b9d; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;}
    .task-card {
        background: #181c24;
        border-left: 4px solid #4f46e5;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px;
        border-radius: 6px;
    }
</style>
""", unsafe_allow_html=True)

# --- Session State Initialization ---
if "sample_data" not in st.session_state:
    st.session_state.sample_data = load_sample_projects()

if "current_project_key" not in st.session_state:
    st.session_state.current_project_key = "telemedicine_app"

if "project" not in st.session_state:
    st.session_state.project = st.session_state.sample_data.get("telemedicine_app", {})

if "api_key" not in st.session_state:
    st.session_state.api_key = ""

if "ai_provider" not in st.session_state:
    st.session_state.ai_provider = "gemini"

if "clickup_token" not in st.session_state:
    st.session_state.clickup_token = ""

if "clickup_list_id" not in st.session_state:
    st.session_state.clickup_list_id = ""

if "trello_key" not in st.session_state:
    st.session_state.trello_key = ""

if "trello_token" not in st.session_state:
    st.session_state.trello_token = ""

if "trello_list_id" not in st.session_state:
    st.session_state.trello_list_id = ""

if "coordinator_agent" not in st.session_state:
    st.session_state.coordinator_agent = DigitalProjectCoordinatorAgent()

# Initialize AI Client and Sub-engines
ai_client = AIClient(
    provider=st.session_state.ai_provider,
    api_key=st.session_state.api_key if st.session_state.api_key else None
)
scoping_engine = ScopingEngine(ai_client)
risk_engine = RiskEngine(ai_client)
brief_engine = ExecutiveBriefEngine(ai_client)
clickup_client = ClickUpClient(st.session_state.clickup_token, st.session_state.clickup_list_id)
trello_client = TrelloClient(st.session_state.trello_key, st.session_state.trello_token, st.session_state.trello_list_id)

# --- Sidebar Controls ---
st.sidebar.title("🤖 OmniProject AI")
st.sidebar.caption("Autonomous Digital Project Coordinator")

# Project Switcher
project_options = {
    "telemedicine_app": "🩺 HealthTech Telemedicine Platform",
    "fintech_kyc": "💳 Fintech Instant KYC App",
    "custom": "✨ Custom / AI-Generated Project"
}

def switch_project():
    choice = st.session_state.proj_select
    st.session_state.current_project_key = choice
    if choice in st.session_state.sample_data:
        st.session_state.project = json.loads(json.dumps(st.session_state.sample_data[choice]))

selected_proj = st.sidebar.selectbox(
    "Active Project Workspace:",
    options=list(project_options.keys()),
    format_func=lambda x: project_options[x],
    index=0 if st.session_state.current_project_key == "telemedicine_app" else 1,
    key="proj_select",
    on_change=switch_project
)

st.sidebar.markdown("---")

# Provider Mode Pill
if st.session_state.api_key:
    st.sidebar.success(f"🟢 AI Online: {st.session_state.ai_provider.upper()}")
else:
    st.sidebar.info("💡 Mode: Smart Heuristic AI (Zero-config offline mode ready. Enter API Key in settings for live LLM.)")

# Integration Badges
col_cu, col_tr = st.sidebar.columns(2)
with col_cu:
    if clickup_client.is_connected():
        st.success("ClickUp: Live")
    else:
        st.caption("ClickUp: Simulated")
with col_tr:
    if trello_client.is_connected():
        st.success("Trello: Live")
    else:
        st.caption("Trello: Simulated")

st.sidebar.markdown("---")

# Quick Actions
st.sidebar.subheader("⚡ Quick Agent Triggers")
if st.sidebar.button("🔄 Run Full Agent Audit", use_container_width=True):
    st.session_state.coordinator_agent.log_action("MANUAL_AUDIT", "User manually initiated full project audit.")
    st.toast("AI Coordinator completed full board audit!", icon="🤖")

st.sidebar.markdown("---")
st.sidebar.caption("Based on tools & methodologies from **AI CERTs™ Managing Projects with AI** (Coursera).")

# --- Main App Header ---
proj = st.session_state.project
tasks = proj.get("tasks", [])
risks = proj.get("risks", [])

# Calculate top-level stats
total_pts = sum(t.get("story_points", 0) for t in tasks)
done_pts = sum(t.get("story_points", 0) for t in tasks if t.get("status") == "Done")
pct_complete = round((done_pts / total_pts * 100), 1) if total_pts > 0 else 0
blocked_count = len([t for t in tasks if t.get("status") == "Blocked"])

# RAG calculation
if blocked_count >= 2:
    rag_badge = "🔴 RED (Critical Blockers)"
elif blocked_count == 1 or pct_complete < 30:
    rag_badge = "🟡 AMBER (Attention Needed)"
else:
    rag_badge = "🟢 GREEN (On Track)"

col_h1, col_h2 = st.columns([3, 1])
with col_h1:
    st.title(proj.get("title", "Project Management AI Suite"))
    st.write(proj.get("description", "AI-driven project workspace"))
with col_h2:
    st.markdown(f"**Health Indicator:** `{rag_badge}`")
    st.markdown(f"**Methodology:** `{proj.get('methodology', 'Agile / Scrum')}`")
    st.progress(pct_complete / 100, text=f"Sprint Progress: {pct_complete}%")

st.markdown("---")

# --- Main Tabs Layout ---
tab_wbs, tab_kanban, tab_risk, tab_agent, tab_brief, tab_settings = st.tabs([
    "📋 1. Scoping & WBS",
    "🗂️ 2. Kanban Board",
    "⚠️ 3. Risk Matrix & Bottlenecks",
    "🤖 4. AI Coordinator Agent",
    "📈 5. Executive Brief",
    "⚙️ 6. Integrations & Prompts"
])

# =========================================================================
# TAB 1: SCOPING & WBS (Work Breakdown Structure)
# =========================================================================
with tab_wbs:
    st.subheader("💡 Generative AI Project Scoping & Work Breakdown")
    st.caption("Converts ambiguous feature requirements into structured Epics, User Stories, and Gherkin Acceptance Criteria.")

    with st.expander("📝 Enter New Project Scope / Feature Brief", expanded=True):
        default_prompt_text = (
            "We need to build a Customer Feedback & Complaint Management SaaS. "
            "It must ingest customer tickets from email, chat, and social media, categorize urgency using AI sentiment analysis, "
            "and assign tickets to tier-1 vs tier-2 support with an SLA of under 2 hours."
        )
        user_brief = st.text_area(
            "Project Brief / Requirements:",
            value=default_prompt_text,
            height=120,
            help="Type client requirements, functional specs, or product feature notes."
        )
        
        c_m1, c_m2, c_m3 = st.columns([2, 2, 2])
        with c_m1:
            methodology_choice = st.selectbox("Delivery Methodology:", ["Agile / Scrum", "Kanban / Continuous Flow", "Extreme Programming (XP)"])
        with c_m2:
            sprint_weeks_choice = st.slider("Sprint Cadence (Weeks):", 1, 4, 2)
        with c_m3:
            st.write("")
            st.write("")
            gen_btn = st.button("🚀 Generate AI WBS Backlog", type="primary", use_container_width=True)

    if gen_btn:
        with st.spinner("AI Agent analyzing requirements, generating Epics, Gherkin acceptance criteria, and story points..."):
            new_wbs = scoping_engine.generate_wbs(user_brief, methodology=methodology_choice, sprint_weeks=sprint_weeks_choice)
            
            # Update current project
            st.session_state.project = {
                "title": new_wbs.get("project_title", "Custom AI Project"),
                "description": new_wbs.get("executive_summary", user_brief),
                "methodology": methodology_choice,
                "sprint_duration_weeks": sprint_weeks_choice,
                "team_members": [
                    {"name": "Team Lead", "role": "Architect", "capacity_hours": 40},
                    {"name": "Senior Developer", "role": "Fullstack", "capacity_hours": 40},
                    {"name": "QA Specialist", "role": "Quality & Security", "capacity_hours": 35}
                ],
                "epics": new_wbs.get("epics", []),
                "tasks": new_wbs.get("tasks", []),
                "risks": []
            }
            # Automatically synthesize initial risks
            initial_risks = risk_engine.analyze_risks(new_wbs.get("project_title", "Project"), new_wbs.get("tasks", []))
            st.session_state.project["risks"] = initial_risks
            st.session_state.current_project_key = "custom"
            st.success("✅ Backlog synthesized! Review the Epics and Tasks below or explore the Kanban Board.")
            st.rerun()

    # Display Current Epics & Tasks
    st.markdown("### 📦 Active Project Backlog")
    
    col_epics, col_sync = st.columns([3, 1])
    with col_sync:
        st.write("#### 🚀 Push to PM Tools")
        if st.button("📤 Sync to ClickUp", use_container_width=True):
            res = clickup_client.sync_all_tasks(tasks)
            st.session_state.coordinator_agent.log_action("CLICKUP_SYNC", f"Pushed {len(res)} tasks to ClickUp.")
            st.success(f"Synced {len(res)} tasks to ClickUp! (Mode: {'Live' if clickup_client.is_connected() else 'Simulated'})")
        
        if st.button("📤 Sync to Trello", use_container_width=True):
            res = trello_client.sync_all_cards(tasks)
            st.session_state.coordinator_agent.log_action("TRELLO_SYNC", f"Pushed {len(res)} cards to Trello.")
            st.success(f"Synced {len(res)} cards to Trello! (Mode: {'Live' if trello_client.is_connected() else 'Simulated'})")

    with col_epics:
        for epic in proj.get("epics", []):
            with st.expander(f"📌 {epic.get('id')}: {epic.get('title')} ({epic.get('priority', 'Normal')})", expanded=True):
                epic_tasks = [t for t in tasks if t.get("epic_id") == epic.get("id")]
                if not epic_tasks:
                    epic_tasks = tasks  # Show all if epic_id not matched
                
                for t in epic_tasks:
                    st.markdown(f"**[{t.get('id')}] {t.get('title')}** | Points: `{t.get('story_points', 3)}` | Est: `{t.get('estimated_hours', 10)}h` | Assignee: `{t.get('assignee', 'Unassigned')}`")
                    st.caption(f"📖 *{t.get('user_story', '')}*")
                    st.markdown(f"✅ **Acceptance Criteria (Gherkin):** `{t.get('acceptance_criteria', '')}`")
                    st.markdown("---")

# =========================================================================
# TAB 2: INTERACTIVE KANBAN BOARD
# =========================================================================
with tab_kanban:
    st.subheader("🗂️ Dynamic Sprint Kanban Board")
    st.caption("Visual sprint board inspired by ClickUp and Trello. Move cards to update sprint progress in real-time.")

    statuses = ["To Do", "In Progress", "Blocked", "Done"]
    cols = st.columns(4)

    for i, status in enumerate(statuses):
        with cols[i]:
            status_color = "#3b82f6" if status == "In Progress" else "#ef4444" if status == "Blocked" else "#10b981" if status == "Done" else "#6b7280"
            st.markdown(f"<div style='border-bottom: 3px solid {status_color}; padding-bottom: 4px; font-weight: 700; margin-bottom: 12px;'>{status.upper()} ({len([t for t in tasks if t.get('status') == status])})</div>", unsafe_allow_html=True)
            
            for t in tasks:
                if t.get("status") == status:
                    p_badge = t.get("priority", "Medium")
                    badge_class = f"badge-{p_badge.lower()}" if p_badge.lower() in ["urgent", "high", "medium", "low"] else "badge-medium"
                    
                    st.markdown(f"""
                    <div class="task-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 11px; color: #9ca3af; font-weight: bold;">{t.get('id')}</span>
                            <span class="{badge_class}">{p_badge}</span>
                        </div>
                        <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">{t.get('title')}</div>
                        <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">👤 {t.get('assignee', 'Unassigned')}</div>
                        <div style="font-size: 11px; color: #94a3b8;">🎯 {t.get('story_points', 3)} Pts &nbsp;|&nbsp; ⏱️ {t.get('estimated_hours', 0)}h</div>
                    </div>
                    """, unsafe_allow_html=True)

                    if status == "Blocked" and t.get("blocker_reason"):
                        st.error(f"🚨 Blocker: {t.get('blocker_reason')}")

                    # Quick status shift buttons
                    with st.expander("Move / Update Card"):
                        new_stat = st.selectbox(
                            "Status:",
                            options=statuses,
                            index=statuses.index(status),
                            key=f"status_select_{t.get('id')}"
                        )
                        if new_stat != status:
                            t["status"] = new_stat
                            st.session_state.coordinator_agent.log_action("CARD_MOVE", f"Moved {t.get('id')} to {new_stat}")
                            st.rerun()

                        if new_stat == "Blocked":
                            blocker_txt = st.text_input("Blocker reason:", value=t.get("blocker_reason", ""), key=f"bl_{t.get('id')}")
                            if blocker_txt != t.get("blocker_reason"):
                                t["blocker_reason"] = blocker_txt

# =========================================================================
# TAB 3: DYNAMIC RISK REGISTER & BOTTLENECK MATRIX
# =========================================================================
with tab_risk:
    st.subheader("⚠️ Dynamic Risk Log & Probability × Impact Matrix")
    st.caption("Predictive risk modeling inspired by ClickUp analytics and modern PMI risk frameworks.")

    col_r1, col_r2 = st.columns([1, 1])

    # Calculate Bottlenecks
    bottlenecks = risk_engine.compute_bottlenecks(tasks)

    with col_r1:
        st.markdown("#### 🚨 Predictive Bottleneck Scanner")
        if not bottlenecks:
            st.success("🎉 No critical bottlenecks detected on active task paths!")
        else:
            for b in bottlenecks:
                st.warning(f"**[{b['type']}] {b['task_id']} - {b['title']}**\n\n"
                           f"👤 Assignee: `{b['assignee']}`\n\n"
                           f"💥 Impact: {b['impact_summary']}\n\n"
                           f"📝 Reason: *{b['blocker_reason']}*")

    with col_r2:
        st.markdown("#### 🎯 Risk Matrix (Probability vs. Impact)")
        if risks:
            df_risks = pd.DataFrame(risks)
            
            fig = px.scatter(
                df_risks,
                x="probability",
                y="impact",
                size="score",
                color="severity",
                hover_name="id",
                hover_data={"description": True, "score": True, "owner": True},
                color_discrete_map={"Critical": "#ef4444", "High": "#f97316", "Moderate": "#eab308", "Low": "#10b981"},
                range_x=[0.5, 5.5],
                range_y=[0.5, 5.5],
                title="Risk Heatmap (Click pins for details)"
            )
            fig.update_layout(
                xaxis_title="Probability (1: Rare → 5: Almost Certain)",
                yaxis_title="Impact (1: Negligible → 5: Catastrophic)",
                height=320,
                margin=dict(l=20, r=20, t=40, b=20)
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No active risks. Click regenerate below to synthesize.")

    # Scored Risk Register Table
    st.markdown("#### 📋 Scored Risk Register")
    if risks:
        risk_table_data = []
        for r in risks:
            risk_table_data.append({
                "Risk ID": r.get("id"),
                "Category": r.get("category"),
                "Description": r.get("description"),
                "P": r.get("probability"),
                "I": r.get("impact"),
                "Score": r.get("score"),
                "Severity": r.get("severity"),
                "Mitigation Strategy": r.get("mitigation_strategy"),
                "Owner": r.get("owner")
            })
        st.dataframe(pd.DataFrame(risk_table_data), use_container_width=True)

    if st.button("🔄 Regenerate Dynamic Risk Log via AI", use_container_width=True):
        with st.spinner("AI evaluating board dependencies, technical risks, and critical path..."):
            updated_risks = risk_engine.analyze_risks(proj.get("title", "Project"), tasks)
            st.session_state.project["risks"] = updated_risks
            st.session_state.coordinator_agent.log_action("RISK_UPDATE", "Dynamic risk register recalculated.")
            st.success("Risk Log updated!")
            st.rerun()

# =========================================================================
# TAB 4: VIRTUAL AI AGENT COORDINATOR
# =========================================================================
with tab_agent:
    st.subheader("🤖 Autonomous Digital Project Coordinator")
    st.caption("Virtual AI Agent performing automated capacity balancing (Wrike concept), quality checks, and team nudges.")

    # Run coordinator audit
    agent_report = st.session_state.coordinator_agent.audit_project(proj)
    
    col_ag1, col_ag2, col_ag3 = st.columns(3)
    with col_ag1:
        st.metric("Execution Health Score", f"{agent_report['health_score']} / 100", delta="-12" if blocked_count > 0 else "+5")
    with col_ag2:
        st.metric("Overloaded Team Members", len(agent_report['workload']['overloaded']), delta=f"{len(agent_report['workload']['overloaded'])} Alert" if agent_report['workload']['overloaded'] else "Normal")
    with col_ag3:
        st.metric("Acceptance Criteria Compliance", f"{agent_report['quality']['compliance_pct']}%", delta=f"{agent_report['quality']['valid_count']}/{agent_report['quality']['total_count']} Valid")

    st.markdown("---")

    # Workload Allocation & Capacity Balancing (Wrike Feature)
    st.markdown("#### ⚖️ Smart Resource Workload Balancing (Wrike Feature)")
    workload_df = pd.DataFrame(agent_report['workload']['stats_table'])
    
    col_w_chart, col_w_table = st.columns([1, 1])
    with col_w_chart:
        # Bar chart comparing capacity vs allocated hours
        chart_data = []
        for mem in agent_report['workload']['all']:
            chart_data.append({"Member": mem["role"], "Hours": mem["capacity_hours"], "Type": "Capacity (h)"})
            chart_data.append({"Member": mem["role"], "Hours": mem["allocated_hours"], "Type": "Allocated (h)"})
        
        fig_work = px.bar(
            pd.DataFrame(chart_data),
            x="Member",
            y="Hours",
            color="Type",
            barmode="group",
            title="Capacity vs Active Allocated Hours",
            color_discrete_map={"Capacity (h)": "#6b7280", "Allocated (h)": "#f97316"}
        )
        fig_work.update_layout(height=280, margin=dict(l=20, r=20, t=30, b=20))
        st.plotly_chart(fig_work, use_container_width=True)

    with col_w_table:
        st.dataframe(workload_df, use_container_width=True)
        if agent_report['workload']['overloaded']:
            for ov in agent_report['workload']['overloaded']:
                st.error(f"⚠️ **{ov['name']} ({ov['role']})** is over-allocated at **{ov['load_pct']}%** capacity! Reassignment advised.")

    st.markdown("---")

    # Automated Team Nudges
    st.markdown("#### 🔔 AI Agent Nudge Station")
    st.caption("Context-rich message drafts generated automatically by the coordinator to unblock stalled tasks.")
    
    if not agent_report["nudges"]:
        st.info("No blocked tasks requiring nudges right now.")
    else:
        for nudge in agent_report["nudges"]:
            with st.expander(f"✉️ Nudge Draft: {nudge['assignee']} on '{nudge['task_title']}'", expanded=True):
                st.text_area("Message Preview:", value=nudge["nudge_message"], height=80, key=f"ndg_{nudge['task_id']}")
                if st.button(f"📋 Copy Nudge to Clipboard", key=f"btn_ndg_{nudge['task_id']}"):
                    st.toast("Copied to clipboard!", icon="✅")

    st.markdown("---")

    # Agent Audit Feed
    st.markdown("#### 📜 Live AI Coordinator Action Audit Log")
    logs = st.session_state.coordinator_agent.action_logs[-8:]
    if not logs:
        st.caption("No coordinator actions logged yet.")
    else:
        for log in reversed(logs):
            st.caption(f"`[{log['timestamp']}]` **[{log['type']}]** {log['message']}")

# =========================================================================
# TAB 5: EXECUTIVE STATUS BRIEF
# =========================================================================
with tab_brief:
    st.subheader("📈 C-Suite Executive Status Brief")
    st.caption("One-click briefing document summarizing milestones, blockers, and trade-off decisions.")

    if "current_brief" not in st.session_state:
        st.session_state.current_brief = brief_engine.generate_brief(proj, bottlenecks, risks)

    c_br1, c_br2 = st.columns([3, 1])
    with c_br2:
        st.write("#### ⚡ Brief Actions")
        if st.button("🔄 Generate Fresh Brief", type="primary", use_container_width=True):
            with st.spinner("AI synthesizing project status report for executive leadership..."):
                fresh_brief = brief_engine.generate_brief(proj, bottlenecks, risks)
                st.session_state.current_brief = fresh_brief
                st.session_state.coordinator_agent.log_action("EXECUTIVE_BRIEF", "Generated fresh Executive Brief.")
                st.rerun()

        st.download_button(
            "📥 Download Report (.md)",
            data=st.session_state.current_brief,
            file_name=f"{proj.get('title', 'project').lower().replace(' ', '_')}_executive_brief.md",
            mime="text/markdown",
            use_container_width=True
        )

    with c_br1:
        st.markdown(st.session_state.current_brief)

# =========================================================================
# TAB 6: INTEGRATIONS & PROMPT STUDIO
# =========================================================================
with tab_settings:
    st.subheader("⚙️ Integrations & Prompt Engineering Studio")
    st.caption("Configure API keys for live cloud sync and inspect the course's context-rich prompt templates.")

    col_set1, col_set2 = st.columns(2)

    with col_set1:
        st.markdown("#### 🔑 AI Provider Configuration")
        ai_p = st.selectbox("AI Model Provider:", ["Google Gemini", "OpenAI"], index=0 if st.session_state.ai_provider == "gemini" else 1)
        st.session_state.ai_provider = "gemini" if ai_p == "Google Gemini" else "openai"
        
        key_input = st.text_input(
            f"{ai_p} API Key:",
            value=st.session_state.api_key,
            type="password",
            help="Leave blank to use the smart zero-config heuristic generator."
        )
        if key_input != st.session_state.api_key:
            st.session_state.api_key = key_input
            st.success("API Key updated!")

        st.markdown("---")
        st.markdown("#### 🏢 ClickUp v2 API Integration")
        cu_tok = st.text_input("ClickUp Personal API Token:", value=st.session_state.clickup_token, type="password")
        cu_list = st.text_input("Target ClickUp List ID:", value=st.session_state.clickup_list_id)
        if cu_tok != st.session_state.clickup_token or cu_list != st.session_state.clickup_list_id:
            st.session_state.clickup_token = cu_tok
            st.session_state.clickup_list_id = cu_list
            st.success("ClickUp credentials saved!")

    with col_set2:
        st.markdown("#### 📋 Trello REST API Integration")
        tr_k = st.text_input("Trello API Key:", value=st.session_state.trello_key)
        tr_t = st.text_input("Trello API Token:", value=st.session_state.trello_token, type="password")
        tr_l = st.text_input("Trello List ID:", value=st.session_state.trello_list_id)
        if tr_k != st.session_state.trello_key or tr_t != st.session_state.trello_token or tr_l != st.session_state.trello_list_id:
            st.session_state.trello_key = tr_k
            st.session_state.trello_token = tr_t
            st.session_state.trello_list_id = tr_l
            st.success("Trello credentials saved!")

    st.markdown("---")
    st.markdown("### 📚 Prompt Engineering Studio (AI CERTs Course Templates)")
    st.caption("These are the production prompt structures taught in the course. You can inspect or copy them below.")

    with st.expander("🔍 1. Advanced Project Scoping & WBS Prompt"):
        st.code(SCOPING_SYSTEM_PROMPT, language="markdown")

    with st.expander("🔍 2. Dynamic Risk Register & P×I Matrix Prompt"):
        st.code(RISK_SYSTEM_PROMPT, language="markdown")

    with st.expander("🔍 3. C-Suite Executive Status Brief Prompt"):
        st.code(EXECUTIVE_SYSTEM_PROMPT, language="markdown")
