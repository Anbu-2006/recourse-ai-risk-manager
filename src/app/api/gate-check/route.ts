import { NextRequest, NextResponse } from "next/server";
import { recourseStore } from "@/lib/store";
import { evaluateHardGate } from "@/lib/gate";
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

    const mandate = recourseStore.getMandate();
    const gateResult = evaluateHardGate(proposed, mandate);

    return NextResponse.json({
      pass: gateResult.pass,
      outcome: gateResult.outcome,
      reason: gateResult.reason,
      checks: gateResult.checks,
      mandate_id: mandate.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Hard gate evaluation error", details: error.message },
      { status: 500 }
    );
  }
}
