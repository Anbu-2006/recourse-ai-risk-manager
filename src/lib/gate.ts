import { Mandate, ProposedTransaction, RuleResults, GateOutcome } from "./types";

export interface GateCheckResult {
  pass: boolean;
  outcome: GateOutcome;
  reason: string;
  checks: RuleResults;
  mandate_snapshot: Mandate;
}

/**
 * Pure deterministic Hard Gate evaluator.
 * ZERO LLM calls.
 * Evaluates the proposed payment against the active mandate constraints.
 */
export function evaluateHardGate(
  proposed: ProposedTransaction,
  mandate: Mandate
): GateCheckResult {
  // 1. Category check
  const normProposedCategory = (proposed.category || "").trim().toLowerCase();
  const normMandateCategory = (mandate.category || "").trim().toLowerCase();
  const categoryMatch = 
    normProposedCategory === normMandateCategory ||
    normProposedCategory.includes(normMandateCategory) ||
    normMandateCategory.includes(normProposedCategory);

  // 2. Cap check (Per-item cap & Daily hard cap)
  const itemCapOk = proposed.amount > 0 && proposed.amount <= mandate.per_item_cap;
  const hardCapOk = (mandate.spent_to_date + proposed.amount) <= mandate.daily_hard_cap;
  const capOk = itemCapOk && hardCapOk;

  // 3. Merchant allowlist check
  const normProposedMerchant = (proposed.merchant || "").trim().toLowerCase();
  const merchantOk = mandate.merchant_allowlist.some((m) => {
    const normM = m.trim().toLowerCase();
    return normM === normProposedMerchant || normProposedMerchant.includes(normM) || normM.includes(normProposedMerchant);
  });

  // 4. Time window check
  // Mandate format: "HH:mm" e.g. "06:00" to "23:00"
  let timeOk = true;
  if (mandate.time_window_start && mandate.time_window_end) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [startH, startM] = mandate.time_window_start.split(":").map(Number);
    const [endH, endM] = mandate.time_window_end.split(":").map(Number);

    const startTotalMinutes = (startH || 0) * 60 + (startM || 0);
    const endTotalMinutes = (endH || 0) * 60 + (endM || 0);

    if (startTotalMinutes <= endTotalMinutes) {
      timeOk = currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
    } else {
      // Overnight window (e.g. 22:00 to 06:00)
      timeOk = currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
    }
  }

  const checks: RuleResults = {
    category: categoryMatch,
    cap: capOk,
    merchant: merchantOk,
    time: timeOk,
  };

  const pass = categoryMatch && capOk && merchantOk && timeOk && mandate.status === "active";

  let reason = "All governance boundaries cleared";
  if (mandate.status !== "active") {
    reason = `Mandate is currently ${mandate.status.toUpperCase()} — payment suspended.`;
  } else if (!pass) {
    const failures: string[] = [];
    if (!categoryMatch) {
      failures.push(`Category mismatch (proposed "${proposed.category}", allowed "${mandate.category}")`);
    }
    if (!capOk) {
      if (!itemCapOk) {
        failures.push(`Amount ₹${proposed.amount.toLocaleString()} exceeds per-item cap ₹${mandate.per_item_cap.toLocaleString()}`);
      } else {
        failures.push(`Amount ₹${proposed.amount.toLocaleString()} breaches remaining daily cap (Remaining: ₹${(mandate.daily_hard_cap - mandate.spent_to_date).toLocaleString()})`);
      }
    }
    if (!merchantOk) {
      failures.push(`Merchant "${proposed.merchant}" not in allowed registry [${mandate.merchant_allowlist.join(", ")}]`);
    }
    if (!timeOk) {
      failures.push(`Current time outside allowed mandate window (${mandate.time_window_start} - ${mandate.time_window_end})`);
    }
    reason = failures.join("; ");
  }

  return {
    pass,
    outcome: pass ? "pass" : "fail",
    reason,
    checks,
    mandate_snapshot: { ...mandate },
  };
}
