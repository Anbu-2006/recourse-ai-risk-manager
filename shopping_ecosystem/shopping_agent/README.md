# 🛒 Shopping AI — Autonomous E-Commerce Agent

**Created & Owned by Anbu**

Shopping AI is an autonomous, multimodal conversational shopping assistant built with **Groq AI** and tailored specifically for **ExaStore** with background settlement and risk governance on **Recourse Enterprise** and **Razorpay Rails**.

---

## What Shopping AI Can Do

- **Autonomous Purchasing**: You can tell the AI *"Buy Organic Almond Milk on ExaStore"* — it searches the catalog, checks ratings, verifies price, and places the order.
- **Spending & Delivery Scheduling**: Command the AI to *"Schedule grocery orders for weekends with ₹500 cap"* — it stages a deterministic policy on Recourse.
- **Direct Portal Link**: Built-in option to open the consumer **ExaStore Marketplace** (`http://localhost:3001`) with a single click.
- **Live Recourse Telemetry**: Connects directly to Recourse Gateway (`http://localhost:3000`) so you can watch transactions pass or block in real time.

---

## Quick Start

### 1. Launch Shopping AI
```bash
cd shopping_ecosystem/shopping_agent
python -m streamlit run app.py --server.port 8501
```
The agent UI will be live at: **`http://localhost:8501`**

### 2. Launch ExaStore (Port 3001)
```bash
cd shopping_ecosystem/example_store
node server.js
```
The storefront will be live at: **`http://localhost:3001`**

### 3. Launch Recourse Enterprise (Port 3000)
```bash
npm run start -- -p 3000
```
The governance console will be live at: **`http://localhost:3000`**

---

## Architecture & Integration

```
  [User / Shopper]
         │
         ▼
 ┌───────────────────────────────────────────────┐
 │            SHOPPING AI (by Anbu)              │
 │       Streamlit + Groq Llama/GPT Engine       │
 └───────────────────────┬───────────────────────┘
                         │
                         ├────────────────────────┐
                         ▼                        ▼
           ┌───────────────────────────┐ ┌───────────────────────────┐
           │         EXASTORE          │ │         RECOURSE          │
           │  Consumer Marketplace     │ │  Enterprise Risk Manager  │
           │  (Port 3001)              │ │  (Port 3000)              │
           └─────────────┬─────────────┘ └─────────────┬─────────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
                        ┌──────────────────────────────┐
                        │     RAZORPAY TEST RAILS      │
                        │    Order Created & Settled   │
                        └──────────────────────────────┘
```

---

## Author
- **Owner / Developer:** Anbu
- **License:** MIT
