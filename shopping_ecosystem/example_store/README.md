# ExaStore — Smart Commerce Marketplace

**ExaStore** is a mock e-commerce storefront designed to demonstrate end-to-end autonomous purchasing and risk defense under **Recourse Enterprise** and **Razorpay Rails**.

---

## 1. Quick Start

Run the storefront on **Port 3001**:
```bash
cd example_store
npm start
```
Or simply:
```bash
node server.js
```
The store will be live at: **`http://localhost:3001`**

Ensure that **Recourse Enterprise** is running simultaneously on **Port 3000** (`npm run start -- -p 3000` in the parent directory).

---

## 2. Architecture & The 3-Actor Workflow

1. **The Shopper / Agent (ExaStore UI / Chrome MCP / CLI)**:
   - Browses organic groceries, pantry essentials, and electronics.
   - Adds items to cart and selects delivery address.
   - Triggers order placement.

2. **The Risk Engine (Recourse Gateway on Port 3000)**:
   - **Pass 1**: Sub-0.05ms AST Prompt Injection Sanitizer.
   - **Pass 2**: Address Deliverability Scorer (ADS) — checks if the address is Metro, Informal, or Bogus.
   - **Pass 3**: Zero-LLM Deterministic Hard Gate — verifies item price against active NPCI UPI Reserve mandate and category allowlist.
   - **Pass 4**: Cryptographic signing into the Merkle audit chain (`pge_token`).

3. **Settlement Rails (Razorpay Test Mode)**:
   - If approved, creates an authentic Razorpay Order ID (`order_...`).
   - Order immediately shows up on the Recourse Operations Console and Razorpay Merchant Dashboard.

---

## 3. Interactive Test Scenarios

| Product / Scenario | Price | Result under Default Mandate |
|---|---|---|
| **Organic Almond Milk 1L** | ₹249.00 | **APPROVED** (Within ₹500 cap, Groceries allowed) $\to$ Razorpay order created |
| **Gourmet Olive Oil 1L** | ₹850.00 | **BLOCKED** (Exceeds ₹500 default cap) $\to$ Zero fund leakage |
| **Gaming Laptop RTX 4080** | ₹89,999.00 | **BLOCKED** (Electronics not permitted under active Groceries mandate) |
| **Informal Address** | Any | **ADS Flagged** $\to$ Prompts ₹49 refundable shipping deposit |
| **Adversarial Injection** | Any | **BLOCKED** in <0.05ms by AST pattern matching |

---

## 4. Automation IDs for Autonomous Agents (Chrome MCP)

- Search Input: `#search-input`
- Cart Button: `#btn-cart-toggle`
- Add to Cart: `#add-to-cart-p1`
- Buy Now: `#quick-buy-p1`
- Checkout Button: `#btn-checkout`
- Address Textarea: `#delivery-address-input`
- Injection Checkbox: `#injection-checkbox`
