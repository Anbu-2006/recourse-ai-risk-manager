import { NextRequest, NextResponse } from "next/server";
import { recourseStore } from "@/lib/store";
import { classifyDisputeEvidence } from "@/lib/claude";
import { Dispute, FaultClassification } from "@/lib/types";
import { getDb, DisputeRow } from "@/lib/db";
import { autoContestDispute } from "@/lib/disputeEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support Auto-Contest trigger from Slide-over
    if (body.action === "contest" || body.contest) {
      const disputeId = body.dispute_id || "disp_razorpay_98765";
      const awbNumber = body.awb_number || "987654321";
      const dossier = await autoContestDispute(disputeId, awbNumber);
      return NextResponse.json({
        success: true,
        action: "contested",
        dispute_id: dossier.disputeId,
        dossier,
      });
    }

    const { transaction_id, user_statement } = body;

    if (!transaction_id || !user_statement) {
      return NextResponse.json(
        { error: "transaction_id and user_statement are required" },
        { status: 400 }
      );
    }

    const tx = recourseStore.getTransaction(transaction_id);
    if (!tx) {
      return NextResponse.json(
        { error: `Transaction with id ${transaction_id} not found` },
        { status: 404 }
      );
    }

    const mandate = recourseStore.getMandate();
    const gateCheck = tx.gate_check_id ? recourseStore.getGateCheck(tx.gate_check_id) : undefined;

    // Check if an existing dispute exists
    let dispute = recourseStore.getDisputeByTransactionId(transaction_id);
    if (!dispute) {
      const disputeId = `disp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      dispute = {
        id: disputeId,
        transaction_id,
        user_statement,
        status: "in_triage",
        raised_at: new Date().toISOString(),
      };
      dispute = recourseStore.createDispute(dispute);
    }

    // AI dispute classification
    const classificationResult = await classifyDisputeEvidence(
      dispute,
      tx,
      mandate,
      gateCheck
    );

    const classificationId = `fc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const faultClassification: FaultClassification = {
      id: classificationId,
      dispute_id: dispute.id,
      classification: classificationResult.classification,
      confidence: classificationResult.confidence,
      reasoning: classificationResult.reasoning,
      evidence_refs: classificationResult.evidence_refs,
      reversal_action: classificationResult.reversal_action,
      classified_at: new Date().toISOString(),
    };

    recourseStore.recordFaultClassification(faultClassification);

    return NextResponse.json({
      dispute_id: dispute.id,
      transaction_id: tx.id,
      classification: faultClassification.classification,
      confidence: faultClassification.confidence,
      reasoning: faultClassification.reasoning,
      evidence_refs: faultClassification.evidence_refs,
      reversal_action: faultClassification.reversal_action,
      status: dispute.status,
    });
  } catch (error: any) {
    console.error("Dispute error:", error);
    return NextResponse.json(
      {
        error: "Dispute adjudication failed",
        status: "escalated_to_human",
        reason: error.message || "Failed to evaluate dispute safely. Escalated to manual operator review.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("transaction_id");
  const disputeId = searchParams.get("dispute_id");
  const db = getDb();

  if (disputeId) {
    const dispute = db.prepare("SELECT * FROM disputes WHERE dispute_id = ?").get(disputeId) as DisputeRow | undefined;
    if (dispute) {
      let dossier = null;
      try {
        dossier = dispute.dossier_json ? JSON.parse(dispute.dossier_json) : null;
      } catch {}
      return NextResponse.json({ dispute, dossier });
    }
  }

  if (txId) {
    const dispute = recourseStore.getDisputeByTransactionId(txId);
    return NextResponse.json({ dispute: dispute || null });
  }

  // If no params, return all active disputes in SQLite
  const allDisputes = db.prepare("SELECT * FROM disputes ORDER BY contested_at DESC").all();
  return NextResponse.json({ disputes: allDisputes });
}
