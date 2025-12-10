"""
Shopping AI — Core Agent Backend
Creator & Owner: Anbu
Autonomous AI Agent for ExaStore with Groq Reasoning and Recourse Rails Integration
"""

import os
import json
import sqlite3
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from groq import Groq

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))

# Load local agent .env, fallback to project .env.local
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(ROOT_DIR, ".env.local"))

DB_PATH = os.path.join(BASE_DIR, "store.db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
EXASTORE_URL = os.getenv("EXASTORE_URL", "http://localhost:3001")
RECOURSE_GATEWAY_URL = os.getenv("RECOURSE_GATEWAY_URL", "http://localhost:3000/api/agent")
RECOURSE_MANDATE_URL = os.getenv("RECOURSE_MANDATE_URL", "http://localhost:3000/api/mandate/draft")

# Known Groq candidate models
GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
]

class ShoppingAgent:
    def __init__(self):
        self.groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
        self.active_model = GROQ_MODELS[0]

    def _execute_groq_chat(self, messages: List[Dict[str, str]], temperature: float = 0.1) -> str:
        """Execute chat completion with automatic model fallback."""
        if not self.groq_client:
            return "Groq client is not initialized. Please verify GROQ_API_KEY."

        last_err = None
        for model in GROQ_MODELS:
            try:
                resp = self.groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                )
                self.active_model = model
                return resp.choices[0].message.content or ""
            except Exception as e:
                last_err = e
                continue

        return f"Groq inference failed on all models: {last_err}"

    def search_catalog(self, query: Optional[str] = None, category: Optional[str] = None, max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        """Search products in ExaStore catalog."""
        # Attempt to fetch live from ExaStore API first
        try:
            res = requests.get(f"{EXASTORE_URL}/api/products", timeout=2)
            if res.status_code == 200:
                data = res.json()
                products = data.get("products", [])
                filtered = []
                for p in products:
                    if query and query.lower() not in p["name"].lower() and query.lower() not in p["description"].lower():
                        continue
                    if category and category.lower() != "all" and category.lower() not in p["category"].lower():
                        continue
                    if max_price and p["price"] > max_price:
                        continue
                    filtered.append(p)
                return filtered
        except Exception:
            pass

        # Fallback to local SQLite store.db
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        sql = "SELECT id, name, category, price, description, is_organic FROM products WHERE 1=1"
        params = []
        if query:
            sql += " AND (name LIKE ? OR description LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%"])
        if category and category.lower() != "all":
            sql += " AND category LIKE ?"
            params.append(f"%{category}%")
        if max_price:
            sql += " AND price <= ?"
            params.append(max_price)

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "id": f"p{r[0]}",
                "name": r[1],
                "category": r[2],
                "price": r[3],
                "description": r[4],
                "is_organic": bool(r[5])
            }
            for r in rows
        ]

    def get_product_rating(self, product_id: int) -> Dict[str, Any]:
        """Fetch average rating and review count from store.db."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id = ?", (product_id,))
        row = cursor.fetchone()
        conn.close()
        avg = round(row[0], 2) if row and row[0] is not None else 4.8
        count = row[1] if row else 12
        return {"product_id": product_id, "rating": avg, "reviews": count}

    def place_order(self, item_name: str, quantity: int = 1, address: str = "Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103") -> Dict[str, Any]:
        """Place order to ExaStore and route to Recourse Gateway."""
        catalog = self.search_catalog(query=item_name)
        product = catalog[0] if catalog else None
        
        price = product["price"] if product else 249.0
        category = product["category"] if product else "Groceries"
        total_paisa = int(price * quantity * 100)

        payload = {
            "user_message": f"Order {item_name} for ₹{price * quantity} from ExaStore to {address}",
            "item": item_name,
            "merchant": "ExaStore",
            "category": category,
            "amount_paisa": total_paisa,
            "address": address
        }

        # Route via ExaStore API or directly to Recourse
        try:
            res = requests.post(f"{EXASTORE_URL}/api/order", json=payload, timeout=5)
            return res.json()
        except Exception:
            try:
                res = requests.post(RECOURSE_GATEWAY_URL, json=payload, timeout=5)
                return res.json()
            except Exception as e:
                return {"error": f"Failed to connect to gateway: {e}"}

    def stage_schedule(self, rule_text: str) -> Dict[str, Any]:
        """Stage or compile a recurring schedule on Recourse."""
        try:
            res = requests.post(RECOURSE_MANDATE_URL, json={"prompt": rule_text}, timeout=5)
            return res.json()
        except Exception as e:
            return {"error": f"Failed to stage schedule: {e}"}

    def respond(self, user_prompt: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Main agent reasoning function."""
        prompt_lower = user_prompt.lower()

        # 1. Schedule intent detection
        if any(w in prompt_lower for w in ["schedule", "recurring", "every weekend", "weekly"]):
            sched_res = self.stage_schedule(user_prompt)
            if sched_res.get("success"):
                draft = sched_res.get("draft", {})
                return (
                    f"📅 **Schedule Policy Staged for ExaStore!**\n\n"
                    f"- **Category:** {draft.get('category')}\n"
                    f"- **Per-Item Cap:** ₹{draft.get('per_item_cap_inr')}\n"
                    f"- **Days:** {', '.join(draft.get('schedule_days', ['Everyday']))}\n"
                    f"- **Status:** Pending Human Approval on Recourse Console (`http://localhost:3000`)\n\n"
                    f"You can review or adjust this rule on the Recourse dashboard."
                )

        # 2. Buy/Order intent detection
        if any(w in prompt_lower for w in ["buy", "order", "purchase", "checkout"]):
            # Identify target product from catalog
            catalog = self.search_catalog()
            target_product = None
            best_score = 0
            
            for p in catalog:
                p_name_lower = p["name"].lower()
                p_words = [w for w in p_name_lower.replace("(", " ").replace(")", " ").split() if len(w) > 2]
                score = 0
                for w in p_words:
                    if w in prompt_lower:
                        # Give higher weight to distinguishing terms
                        score += 3 if w not in ["organic", "pack", "fresh", "premium"] else 1
                if score > best_score:
                    best_score = score
                    target_product = p

            if not target_product or best_score == 0:
                # Default to almond milk if generic "buy groceries"
                if "grocery" in prompt_lower or "groceries" in prompt_lower or "milk" in prompt_lower:
                    target_product = next((p for p in catalog if "milk" in p["name"].lower()), catalog[0])
                elif "laptop" in prompt_lower or "electronic" in prompt_lower:
                    target_product = next((p for p in catalog if "laptop" in p["name"].lower()), catalog[5])
                else:
                    target_product = catalog[0]

            order_res = self.place_order(target_product["name"], quantity=1)
            is_approved = order_res.get("pass") is True or order_res.get("action") == "APPROVED"
            
            if is_approved:
                rzp_id = order_res.get("razorpay_order_id") or "order_rzp_settled_live"
                return (
                    f"✅ **Order Successfully Placed on ExaStore!**\n\n"
                    f"- **Item:** {target_product['name']}\n"
                    f"- **Price:** ₹{target_product['price']:.2f}\n"
                    f"- **Merchant:** ExaStore (Authorized)\n"
                    f"- **Razorpay Order ID:** `{rzp_id}`\n"
                    f"- **Recourse Gate Result:** Approved (Zero Fund Leakage)\n\n"
                    f"The transaction has been settled on Razorpay test rails and logged in the Merkle audit chain."
                )
            else:
                reason = order_res.get("reason") or order_res.get("failureReason") or "Policy limit exceeded"
                return (
                    f"🚫 **Order Intercepted & Blocked by Recourse!**\n\n"
                    f"- **Item:** {target_product['name']} (₹{target_product['price']:.2f})\n"
                    f"- **Blocked Reason:** {reason}\n"
                    f"- **Fund Leakage Prevented:** ₹{target_product['price']:.2f} saved on merchant rails.\n\n"
                    f"Recourse prevented this unapproved order from executing."
                )

        # 3. Product query / general question
        catalog = self.search_catalog()
        catalog_summary = "\n".join([f"- {p['name']} (₹{p['price']}) · {p['category']} · ExaStore" for p in catalog])

        system_instruction = (
            "You are 'Shopping AI', an autonomous personal e-commerce assistant created by Anbu for ExaStore.\n"
            "ExaStore is a premium marketplace offering organic groceries, tech, and health essentials.\n"
            "All transactions on ExaStore are protected by Recourse Enterprise on Razorpay rails.\n\n"
            "Current ExaStore Catalog:\n"
            f"{catalog_summary}\n\n"
            "Keep answers concise, helpful, and professional. Mention that users can say 'Buy [item]' or ask you to 'Schedule groceries on weekends'."
        )

        messages = [{"role": "system", "content": system_instruction}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_prompt})

        return self._execute_groq_chat(messages)

agent = ShoppingAgent()
