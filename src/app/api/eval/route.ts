import { NextResponse } from "next/server";
import { runBenchmark } from "@/lib/benchmark";

export async function GET() {
  try {
    const benchmarkData = runBenchmark();
    
    // Map benchmark results to legacy evaluation view schema while providing full enterprise metrics
    const mappedScenarios = benchmarkData.results.map((r) => ({
      id: r.id,
      prompt: r.description,
      mandate_constraint: r.type === "PROMPT_INJECTION" 
        ? "Pass 1 Regex/AST (<2ms): Zero tolerance for prompt injection"
        : r.type === "RTO_BOGUS_ADDRESS"
        ? "Pass 2 ADS Scorer: ADS < 0.40 requires UPI Reserve Pay Hold"
        : r.type === "DAO_CHARGEBACK_DISPUTE"
        ? "Visa CE 3.0 + Carrier OTP Handshake: 92% Win Probability"
        : "Mandate groceries cap ₹500 & allowlist [BigBasket, Blinkit, Zepto]",
      true_label: r.type,
      predicted_label: r.predicted_action,
      match: r.match,
      latency_ms: r.latency_ms,
      ads_score: r.ads_score,
      bayes_tau: r.bayes_tau,
      capital_saved_inr: r.capital_saved_inr,
      reason: r.reason,
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        accuracy: benchmarkData.accuracy,
        precision: benchmarkData.precision,
        recall: benchmarkData.recall,
        false_positive_rate_no_fault: benchmarkData.falsePositiveRate,
        total_evaluated: benchmarkData.totalScenarios,
        overreach_reversal_recall: benchmarkData.recall,
        avg_latency_ms: benchmarkData.avgLatencyMs,
        net_capital_preserved_inr: benchmarkData.netCapitalPreservedInr,
        passed_count: benchmarkData.confusionMatrix.truePositive + benchmarkData.confusionMatrix.trueNegative,
        mismatch_count: benchmarkData.confusionMatrix.falsePositive + benchmarkData.confusionMatrix.falseNegative,
        confusion_matrix: benchmarkData.confusionMatrix,
      },
      scenarios: mappedScenarios,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/eval:", error);
    return NextResponse.json(
      { error: error.message || "Evaluation harness execution failed" },
      { status: 500 }
    );
  }
}
