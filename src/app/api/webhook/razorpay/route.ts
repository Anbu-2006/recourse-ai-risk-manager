import { NextRequest, NextResponse } from "next/server";
import { autoContestDispute } from "@/lib/disputeEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both authentic Razorpay webhook envelope and direct invocation
    let disputeId = "disp_razorpay_98765";
    let awbNumber = "987654321";

    if (body.event === "payment.dispute.created" && body.payload?.dispute?.entity) {
      const entity = body.payload.dispute.entity;
      disputeId = entity.id || disputeId;
      awbNumber = entity.notes?.awb_number || awbNumber;
    } else if (body.dispute_id) {
      disputeId = body.dispute_id;
      awbNumber = body.awb_number || awbNumber;
    } else if (body.id) {
      disputeId = body.id;
    }

    // Auto-contest dispute: compiles Carrier OTP + Visa CE 3.0 evidence and posts to Razorpay rails
    const dossier = await autoContestDispute(disputeId, awbNumber);

    return NextResponse.json({
      success: true,
      event: "payment.dispute.contested",
      dispute_id: dossier.disputeId,
      razorpay_payment_id: dossier.razorpayPaymentId,
      dispute_amount_paisa: dossier.disputeAmountPaisa,
      win_probability: dossier.winProbability,
      evidence_summary: {
        carrier_otp_verified: dossier.carrierProof.otp_verified,
        carrier_delivery_status: dossier.carrierProof.status,
        gps_coordinates: dossier.carrierProof.gps_coordinates,
        ce3_matched_transactions: dossier.visaCE3Matches.length,
      },
      legal_rebuttal: dossier.rebuttalLetter,
      razorpay_contest_response: dossier.razorpayContestResponse,
      compiled_at: dossier.compiledAt,
    });
  } catch (error: any) {
    console.error("Error in /api/webhook/razorpay:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Razorpay dispute webhook" },
      { status: 500 }
    );
  }
}
