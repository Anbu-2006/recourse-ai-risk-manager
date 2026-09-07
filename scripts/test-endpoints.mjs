// Standalone automated test runner for Recourse API routes and Hard Gate invariants
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("=== Starting Recourse Automated Invariant Verification Suite ===");
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = "") {
    totalCount++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}: ${details}`);
    }
  }

  try {
    // Keep the smoke suite repeatable after previous runs debit the SQLite mandate.
    await fetch(`${BASE_URL}/api/mandate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mandate_id: "mandate_groceries_001",
        action: "RESET",
      }),
    });

    // 1. Test Hard Gate PASS
    console.log("\n--- Testing POST /api/gate-check ---");
    const gatePassRes = await fetch(`${BASE_URL}/api/gate-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposed_transaction: {
          merchant: "BigBasket",
          item: "Organic Milk",
          amount: 320,
          category: "Groceries",
        },
      }),
    });
    const gatePassData = await gatePassRes.json();
    assert(gatePassData.pass === true, "Hard Gate PASS: In-mandate grocery purchase passes all 4 checks");
    assert(gatePassData.checks.category === true, "Category check passed");
    assert(gatePassData.checks.cap === true, "Cap check passed");
    assert(gatePassData.checks.merchant === true, "Merchant allowlist passed");
    assert(gatePassData.checks.time === true, "Time window passed");

    // 2. Test Hard Gate Cap Violation
    const gateCapRes = await fetch(`${BASE_URL}/api/gate-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposed_transaction: {
          merchant: "BigBasket",
          item: "Expensive Caviar",
          amount: 1200,
          category: "Groceries",
        },
      }),
    });
    const gateCapData = await gateCapRes.json();
    assert(gateCapData.pass === false, "Hard Gate FAIL: Over per-item cap blocked");
    assert(gateCapData.checks.cap === false, "Cap check failed correctly");

    // 3. Test Hard Gate Merchant Violation
    const gateMerchantRes = await fetch(`${BASE_URL}/api/gate-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposed_transaction: {
          merchant: "Amazon Electronics",
          item: "Batteries",
          amount: 250,
          category: "Groceries",
        },
      }),
    });
    const gateMerchantData = await gateMerchantRes.json();
    assert(gateMerchantData.pass === false, "Hard Gate FAIL: Disallowed merchant blocked");
    assert(gateMerchantData.checks.merchant === false, "Merchant check failed correctly");

    // 4. Test Hard Gate Category Violation
    const gateCatRes = await fetch(`${BASE_URL}/api/gate-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposed_transaction: {
          merchant: "BigBasket",
          item: "USB Cable",
          amount: 350,
          category: "Electronics",
        },
      }),
    });
    const gateCatData = await gateCatRes.json();
    assert(gateCatData.pass === false, "Hard Gate FAIL: Disallowed category blocked");
    assert(gateCatData.checks.category === false, "Category check failed correctly");

    // 5. Test Agent Execution (Clean PASS)
    console.log("\n--- Testing POST /api/agent ---");
    const agentPassRes = await fetch(`${BASE_URL}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: "Buy organic oat milk from BigBasket for ₹320",
      }),
    });
    const agentPassData = await agentPassRes.json();
    assert(agentPassData.gate_result.pass === true, "Agent Console: In-mandate prompt executed transaction");
    assert(agentPassData.transaction_status === "executed", "Transaction status is executed");
    assert(!!agentPassData.transaction?.id, "Valid transaction ID generated");

    // 6. Test Agent Execution (Blocked Overreach)
    const agentBlockRes = await fetch(`${BASE_URL}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: "Buy ASUS Gaming Laptop from Croma for ₹64999",
      }),
    });
    const agentBlockData = await agentBlockRes.json();
    assert(agentBlockData.gate_result.pass === false, "Agent Console: Out-of-mandate prompt blocked");
    assert(agentBlockData.transaction_status === "blocked", "Transaction status is blocked");
    assert(agentBlockData.transaction === null, "Defense constraint verified: No transaction object created");

    // 7. Test Audit Log API
    console.log("\n--- Testing GET /api/audit ---");
    const auditRes = await fetch(`${BASE_URL}/api/audit`);
    const auditData = await auditRes.json();
    assert(Array.isArray(auditData.entries) && auditData.entries.length > 0, "Audit log returns non-empty entries");
    assert(auditData.entries[0].event !== undefined, "Audit entry has event property");

    // 8. Test Dispute Adjudication (P1)
    console.log("\n--- Testing POST /api/dispute ---");
    const txToDispute = agentPassData.transaction?.id || "ord_bb_9942a";
    const disputeRes = await fetch(`${BASE_URL}/api/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: txToDispute,
        user_statement: "Merchant delivered spoiled/damaged milk bottles.",
      }),
    });
    const disputeData = await disputeRes.json();
    assert(disputeData.classification === "merchant_fulfillment_error", "Dispute classifier categorized merchant fault correctly");
    assert(disputeData.reversal_action === "merchant_queue", "Reversal router selected merchant_queue");

    // 9. Test Evaluation Benchmark API (P1)
    console.log("\n--- Testing GET /api/eval ---");
    const evalRes = await fetch(`${BASE_URL}/api/eval`);
    const evalData = await evalRes.json();
    assert(evalData.metrics.accuracy >= 80, `Benchmark accuracy is high: ${evalData.metrics.accuracy}%`);
    assert(evalData.metrics.false_positive_rate_no_fault === 0, "Zero false positive rate on no_fault");

    console.log(`\n=== Verification Complete: ${passedCount}/${totalCount} tests passed ===\n`);
    if (passedCount !== totalCount) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runTests();
