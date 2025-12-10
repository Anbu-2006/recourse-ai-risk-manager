import { NextRequest, NextResponse } from "next/server";
import { evaluateHardGate } from "@/lib/riskEngine";
import { ProposedTransaction } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const proposed: ProposedTransaction = body.proposed_transaction || body;

    if (!proposed || typeof proposed.amount !== "number") {
      return NextResponse.json(
        { error: "Invalid payload: proposed_transaction with amount required" },
        { status: 400 }
      );
    }

    const gateResult = evaluateHardGate({
      mandateId: body.mandate_id || "mandate_groceries_001",
      amountPaisa: Math.round(proposed.amount * 100),
      merchant: proposed.merchant,
      category: proposed.category,
    });
    const mandate = gateResult.mandateSnapshot;

    return NextResponse.json({
      pass: gateResult.pass,
      outcome: gateResult.pass ? "pass" : "fail",
      reason: gateResult.reason || "All governance boundaries cleared",
      checks: {
        category: gateResult.checks.category,
        cap: gateResult.checks.cap,
        merchant: gateResult.checks.merchant,
        time: gateResult.checks.status,
      },
      mandate_id: mandate?.mandate_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Hard gate evaluation error", details: error.message },
      { status: 500 }
    );
  }
}
