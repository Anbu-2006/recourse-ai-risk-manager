import { NextRequest, NextResponse } from "next/server";
import { getDb, MandateRow } from "@/lib/db";
import { appendAuditNode } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mandateId = body.mandate_id || "";

    if (!mandateId) {
      return NextResponse.json(
        { error: "mandate_id string is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const target = db.prepare("SELECT * FROM mandates WHERE mandate_id = ?").get(mandateId) as MandateRow | undefined;

    if (!target) {
      return NextResponse.json(
        { error: `Mandate ${mandateId} not found` },
        { status: 404 }
      );
    }

    // Apply optional user edits from the HITL modal
    const updatedCategory = typeof body.category === "string" && body.category.trim() ? body.category.trim() : target.category;
    const updatedCapPaisa = typeof body.per_item_cap_inr === "number" && body.per_item_cap_inr > 0
      ? Math.round(body.per_item_cap_inr * 100)
      : target.per_item_cap_paisa;
    const updatedHoldPaisa = typeof body.daily_hold_inr === "number" && body.daily_hold_inr > 0
      ? Math.round(body.daily_hold_inr * 100)
      : target.initial_hold_paisa;
    const updatedMerchants = Array.isArray(body.allowed_merchants)
      ? JSON.stringify(body.allowed_merchants)
      : target.allowed_merchants;
    const updatedScheduleDays = Array.isArray(body.schedule_days)
      ? JSON.stringify(body.schedule_days)
      : (target.schedule_days || '["Everyday"]');

    // Deactivate previous active mandates
    db.prepare("UPDATE mandates SET status = 'INACTIVE' WHERE status = 'ACTIVE'").run();

    // Update target mandate with any edits and activate
    db.prepare(`
      UPDATE mandates 
      SET category = ?,
          per_item_cap_paisa = ?,
          initial_hold_paisa = ?,
          residual_balance_paisa = ?,
          allowed_merchants = ?,
          schedule_days = ?,
          status = 'ACTIVE'
      WHERE mandate_id = ?
    `).run(
      updatedCategory,
      updatedCapPaisa,
      updatedHoldPaisa,
      updatedHoldPaisa,
      updatedMerchants,
      updatedScheduleDays,
      mandateId
    );

    // Commit signed block to Merkle chain
    const auditNode = appendAuditNode({
      eventType: "MANDATE_HUMAN_APPROVED",
      mandateId: target.mandate_id,
      category: updatedCategory,
      perItemCapPaisa: updatedCapPaisa,
      allowedMerchants: updatedMerchants,
      scheduleDays: updatedScheduleDays,
      status: "ACTIVE",
      approvedBy: "ENTERPRISE_ADMIN_HITL",
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      status: "ACTIVE",
      mandate_id: target.mandate_id,
      category: updatedCategory,
      per_item_cap_inr: updatedCapPaisa / 100,
      daily_hold_inr: updatedHoldPaisa / 100,
      allowed_merchants: JSON.parse(updatedMerchants),
      schedule_days: JSON.parse(updatedScheduleDays),
      merkle_node: auditNode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to approve mandate", details: error.message },
      { status: 500 }
    );
  }
}
