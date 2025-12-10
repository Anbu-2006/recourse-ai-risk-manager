"""
Shopping AI — Interactive Frontend
Creator & Owner: Anbu
Autonomous Shopping Assistant for ExaStore & Recourse Rails
"""

import streamlit as st
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agent_backend import agent, EXASTORE_URL, RECOURSE_GATEWAY_URL

st.set_page_config(
    page_title="Shopping AI — by Anbu",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Institutional CSS
st.markdown("""
<style>
    .main-title {
        font-size: 26px;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: -0.02em;
        margin-bottom: 2px;
    }
    .author-badge {
        display: inline-block;
        font-size: 11px;
        font-family: monospace;
        font-weight: 600;
        color: #475569;
        background-color: #F1F5F9;
        border: 1px solid #CBD5E1;
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
    .store-link-btn {
        display: block;
        text-align: center;
        background-color: #0F172A;
        color: #FFFFFF !important;
        font-weight: 600;
        font-size: 13.5px;
        padding: 10px 16px;
        border-radius: 6px;
        text-decoration: none;
        margin-bottom: 10px;
        transition: all 0.15s ease;
    }
    .store-link-btn:hover {
        background-color: #1E293B;
    }
    .recourse-link-btn {
        display: block;
        text-align: center;
        background-color: #FFFFFF;
        color: #0F172A !important;
        font-weight: 600;
        font-size: 12px;
        padding: 8px 14px;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
        text-decoration: none;
        margin-bottom: 16px;
    }
    .recourse-link-btn:hover {
        background-color: #F8FAFC;
    }
</style>
""", unsafe_allow_html=True)

# ── Sidebar ──
with st.sidebar:
    st.markdown('<div class="main-title">🛒 Shopping AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="author-badge">CREATED BY ANBU · EXASTORE AGENT</div>', unsafe_allow_html=True)
    st.caption("Autonomous AI that searches, manages schedules, and places orders on ExaStore.")

    st.markdown("---")
    st.markdown("### 🌐 Ecosystem Portals")
    
    # One-click option to open ExaStore
    st.markdown(f'<a href="{EXASTORE_URL}" target="_blank" class="store-link-btn">🛒 Open ExaStore Storefront (Port 3001)</a>', unsafe_allow_html=True)
    st.markdown(f'<a href="http://localhost:3000" target="_blank" class="recourse-link-btn">🛡️ Recourse Risk Console (Port 3000)</a>', unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### ⚡ Quick Voice / Text Prompts")
    quick_prompts = [
        ("🥛 Buy Organic Almond Milk", "Buy Organic Almond Milk on ExaStore"),
        ("🥑 Order Fresh Avocados & Honey", "Order Farm Fresh Organic Avocado and Pure Raw Wild Forest Honey"),
        ("📅 Schedule Weekend Groceries", "Set schedule to buy groceries on weekends with ₹500 cap"),
        ("💻 Order Gaming Laptop", "Order Predator ROG RTX 4080 Gaming Laptop on ExaStore"),
    ]

    for label, prompt_val in quick_prompts:
        if st.button(label, key=f"quick_{label}", use_container_width=True):
            st.session_state.pending_prompt = prompt_val

    st.markdown("---")
    st.markdown("### 📋 ExaStore Live Catalog")
    try:
        items = agent.search_catalog()
        for it in items[:5]:
            st.text(f"• {it['name']} — ₹{it['price']}")
    except Exception:
        pass

# ── Main Chat Interface ──
st.title("🛒 Shopping AI")
st.caption("Tell the AI what to buy or schedule on ExaStore. Every order is audited live on Recourse & settled on Razorpay rails.")

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hello! I am **Shopping AI**, created by **Anbu**. I can browse **ExaStore**, place orders for you, or set up scheduled grocery deliveries on weekends. How can I help you today?"
        }
    ]

# Display conversation history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Process input
user_input = st.chat_input("Tell Shopping AI what to buy or schedule...")

if "pending_prompt" in st.session_state and st.session_state.pending_prompt:
    user_input = st.session_state.pending_prompt
    st.session_state.pending_prompt = None

if user_input:
    # Append user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Generate agent response
    with st.chat_message("assistant"):
        with st.spinner("Shopping AI is reasoning with Groq..."):
            history = [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages[-4:-1]]
            reply = agent.respond(user_input, history=history)
            st.markdown(reply)

    # Append assistant response
    st.session_state.messages.append({"role": "assistant", "content": reply})
