import { NextRequest, NextResponse } from "next/server";
import { evaluateADS, evaluatePass1, evaluateHardGate } from "@/lib/riskEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawAddress = body.raw_address || body.address || "";
    const amountPaisa = body.amount_paisa || (body.amount ? Math.round(body.amount * 100) : 24900);
    const merchant = body.merchant || "Blinkit";
    const category = body.category || "Groceries";

    // 1. Pass 1: Injection Check
    const pass1 = evaluatePass1(`${rawAddress} ${merchant}`);
    if (!pass1.passed) {
      return NextResponse.json({
        success: false,
        action: "REJECT",
        reason: "Adversarial Prompt Injection Intercepted in Cart Address Telemetry",
        matched_pattern: pass1.matchedPattern,
        latency_ms: pass1.latencyMs,
      }, { status: 400 });
    }

    // 2. Pass 2: ADS Deliverability Evaluation
    const ads = await evaluateADS(rawAddress);

    // 3. Pass 3: Deterministic Hard Gate
    const hardGate = evaluateHardGate({
      mandateId: "mandate_groceries_001",
      amountPaisa,
      merchant,
      category,
    });

    return NextResponse.json({
      success: true,
      raw_address: rawAddress,
      ads_score: ads.adsScore,
      risk_tier: ads.riskTier,
      payment_strategy: ads.paymentStrategy,
      deposit_paisa: ads.depositPaisa,
      deposit_inr: (ads.depositPaisa / 100).toFixed(2),
      breakdown: {
        syntax: ads.syntaxScore,
        landmark: ads.landmarkScore,
        geo_coherence: ads.geoCoherenceScore,
        gibberish_prob: ads.gibberishProb,
        reason: ads.reason,
      },
      hard_gate: {
        pass: hardGate.pass,
        checks: hardGate.checks,
        reason: hardGate.reason,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/risk/evaluate-order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate order risk" },
      { status: 500 }
    );
  }
}
