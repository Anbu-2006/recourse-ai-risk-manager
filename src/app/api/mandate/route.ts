import { NextRequest, NextResponse } from "next/server";
import { recourseStore } from "@/lib/store";
import { getDb, MandateRow } from "@/lib/db";
import { appendAuditNode } from "@/lib/crypto";
import { rtoConfig, setRTODeposits } from "@/lib/riskEngine";

function mapRowToMandate(row: MandateRow) {
  let allowedMerchants: string[] = ["ExaStore"];
  try {
    allowedMerchants = JSON.parse(row.allowed_merchants);
  } catch {
    allowedMerchants = [row.allowed_merchants];
  }

  let activeSchedule: string[] = ["Everyday"];
  try {
    if (row.schedule_days) {
      activeSchedule = JSON.parse(row.schedule_days);
    }
  } catch {}

  return {
    id: row.mandate_id,
    user_vpa: row.user_vpa,
    category: row.category,
    per_item_cap: row.per_item_cap_paisa / 100,
    daily_hard_cap: row.initial_hold_paisa / 100,
    residual_balance: row.residual_balance_paisa / 100,
    initial_hold: row.initial_hold_paisa / 100,
    merchant_allowlist: allowedMerchants,
    schedule_days: activeSchedule,
    spent_to_date: (row.initial_hold_paisa - row.residual_balance_paisa) / 100,
    time_window_start: "08:00",
    time_window_end: "23:00",
    status: row.status.toLowerCase(),
    created_at: new Date(row.created_at).toISOString(),
    rto_policy: {
      ads_low_threshold: 0.75,
      ads_medium_threshold: 0.40,
      reservation_deposit_inr: rtoConfig.mediumDepositPaisa / 100,
      reserve_pay_hold_inr: rtoConfig.highHoldPaisa / 100,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(req.url);
    const requestedId = url.searchParams.get("mandate_id");

    // Fetch all mandates in SQLite
    const allRows = db.prepare("SELECT * FROM mandates ORDER BY created_at DESC").all() as MandateRow[];
    const allMandates = allRows.map(mapRowToMandate);

    // Pick active mandate or requested mandate
    let primaryMandate = null;
    if (requestedId) {
      primaryMandate = allMandates.find((m) => m.id === requestedId);
    }

    if (!primaryMandate) {
      primaryMandate = allMandates.find((m) => m.status === "active" || m.status === "partially_debited");
    }

    if (!primaryMandate && allMandates.length > 0) {
      primaryMandate = allMandates[0];
    }

    // Query pending mandate (staged via HITL)
    const pendingRow = db.prepare("SELECT * FROM mandates WHERE status = 'PENDING_APPROVAL' ORDER BY created_at DESC LIMIT 1").get() as MandateRow | undefined;
    
    let pendingMandate = null;
    if (pendingRow) {
      let pendingMerchants = ["ExaStore"];
      try {
        pendingMerchants = JSON.parse(pendingRow.allowed_merchants);
      } catch {}

      let pendingSchedule = ["Everyday"];
      try {
        if (pendingRow.schedule_days) {
          pendingSchedule = JSON.parse(pendingRow.schedule_days);
        }
      } catch {}

      pendingMandate = {
        id: pendingRow.mandate_id,
        user_vpa: pendingRow.user_vpa,
        category: pendingRow.category,
        per_item_cap: pendingRow.per_item_cap_paisa / 100,
        daily_hard_cap: pendingRow.initial_hold_paisa / 100,
        merchant_allowlist: pendingMerchants,
        schedule_days: pendingSchedule,
        status: "PENDING_APPROVAL",
        created_at: new Date(pendingRow.created_at).toISOString(),
      };
    }

    if (primaryMandate) {
      return NextResponse.json({ 
        mandate: primaryMandate, 
        mandates: allMandates, 
        pending_mandate: pendingMandate 
      });
    }
  } catch (err) {
    console.warn("Falling back to in-memory store for mandate:", err);
  }

  const mandate = recourseStore.getMandate();
  return NextResponse.json({ mandate, mandates: [mandate], pending_mandate: null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    // Determine target mandate ID
    let targetId = body.mandate_id || body.id;
    if (!targetId) {
      const activeRow = db.prepare("SELECT mandate_id FROM mandates WHERE status IN ('ACTIVE', 'PARTIALLY_DEBITED') ORDER BY created_at DESC LIMIT 1").get() as any;
      targetId = activeRow ? activeRow.mandate_id : "mandate_groceries_001";
    }

    // Check if target mandate exists
    const existing = db.prepare("SELECT * FROM mandates WHERE mandate_id = ?").get(targetId) as MandateRow | undefined;
    if (!existing && body.action !== "DELETE") {
      return NextResponse.json({ error: `Mandate ${targetId} not found` }, { status: 404 });
    }

    // 1. Handle DELETE action
    if (body.action === "DELETE") {
      const countResult = db.prepare("SELECT COUNT(*) as count FROM mandates").get() as { count: number };
      if (countResult.count <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last remaining active policy. At least one policy must remain." },
          { status: 400 }
        );
      }

      const wasActive = existing ? (existing.status === "ACTIVE" || existing.status === "PARTIALLY_DEBITED") : false;
      db.prepare("DELETE FROM mandates WHERE mandate_id = ?").run(targetId);

      // If active mandate was deleted, activate the latest remaining one
      if (wasActive) {
        const remainingActive = db.prepare("SELECT mandate_id FROM mandates WHERE status = 'ACTIVE' LIMIT 1").get() as any;
        if (!remainingActive) {
          const latestRemaining = db.prepare("SELECT mandate_id FROM mandates ORDER BY created_at DESC LIMIT 1").get() as any;
          if (latestRemaining) {
            db.prepare("UPDATE mandates SET status = 'ACTIVE' WHERE mandate_id = ?").run(latestRemaining.mandate_id);
          }
        }
      }

      try {
        appendAuditNode({
          event_type: "MANDATE_DELETED",
          mandate_id: targetId,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn("Audit node warning on delete:", e);
      }

      const allRows = db.prepare("SELECT * FROM mandates ORDER BY created_at DESC").all() as MandateRow[];
      const allMandates = allRows.map(mapRowToMandate);
      const activeMandate = allMandates.find((m) => m.status === "active" || m.status === "partially_debited") || allMandates[0];

      return NextResponse.json({
        success: true,
        deleted_id: targetId,
        mandate: activeMandate,
        mandates: allMandates,
      });
    }

    // 2. Handle mandate activation / switching
    if (body.action === "ACTIVATE" || body.activate === true) {
      db.prepare("UPDATE mandates SET status = 'INACTIVE' WHERE status IN ('ACTIVE', 'PARTIALLY_DEBITED')").run();
      db.prepare("UPDATE mandates SET status = 'ACTIVE' WHERE mandate_id = ?").run(targetId);

      try {
        appendAuditNode({
          event_type: "MANDATE_ACTIVATED",
          mandate_id: targetId,
          category: existing?.category,
          per_item_cap_paisa: existing?.per_item_cap_paisa,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn("Audit node append warning on mandate activation:", e);
      }
    }

    // 3. Handle editable allowlist updates
    if (body.merchant_allowlist !== undefined) {
      const merchants = Array.isArray(body.merchant_allowlist)
        ? body.merchant_allowlist.map((m: any) => String(m).trim()).filter(Boolean)
        : [String(body.merchant_allowlist).trim()];

      db.prepare("UPDATE mandates SET allowed_merchants = ? WHERE mandate_id = ?")
        .run(JSON.stringify(merchants), targetId);

      try {
        appendAuditNode({
          event_type: "MANDATE_ALLOWLIST_UPDATED",
          mandate_id: targetId,
          merchant_allowlist: merchants,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn("Audit node append warning on allowlist update:", e);
      }
    }

    // 4. Handle per-item cap updates (editable amount)
    if (body.per_item_cap !== undefined) {
      const capPaisa = Math.round(Number(body.per_item_cap) * 100);
      db.prepare("UPDATE mandates SET per_item_cap_paisa = ? WHERE mandate_id = ?")
        .run(capPaisa, targetId);
    }

    // 5. Handle budget pool updates (editable amount)
    if (body.daily_hard_cap !== undefined || body.initial_hold !== undefined) {
      const holdVal = Number(body.daily_hard_cap || body.initial_hold);
      const holdPaisa = Math.round(holdVal * 100);
      db.prepare("UPDATE mandates SET initial_hold_paisa = ?, residual_balance_paisa = ? WHERE mandate_id = ?")
        .run(holdPaisa, holdPaisa, targetId);
    }

    // 6. Handle RTO Deposit configuration (editable amount)
    if (body.reservation_deposit_inr !== undefined || body.deposit_inr !== undefined) {
      const depositVal = Number(body.reservation_deposit_inr ?? body.deposit_inr);
      setRTODeposits(depositVal);
    }

    // 7. Handle reserve pay budget reload
    if (body.reload_amount !== undefined || body.action === "RELOAD") {
      const topup = body.reload_amount ? Math.round(Number(body.reload_amount) * 100) : 1000000;
      db.prepare(`
        UPDATE mandates 
        SET residual_balance_paisa = residual_balance_paisa + ?,
            initial_hold_paisa = initial_hold_paisa + ?,
            status = 'ACTIVE'
        WHERE mandate_id = ?
      `).run(topup, topup, targetId);
    }

    // 8. Handle balance reset
    if (body.reset_balance || body.action === "RESET") {
      db.prepare(`
        UPDATE mandates 
        SET residual_balance_paisa = initial_hold_paisa,
            status = 'ACTIVE'
        WHERE mandate_id = ?
      `).run(targetId);
    }

    // Fetch updated row and all mandates
    const updatedRow = db.prepare("SELECT * FROM mandates WHERE mandate_id = ?").get(targetId) as MandateRow;
    const allRows = db.prepare("SELECT * FROM mandates ORDER BY created_at DESC").all() as MandateRow[];
    
    const updatedMandate = updatedRow ? mapRowToMandate(updatedRow) : null;
    const allMandates = allRows.map(mapRowToMandate);

    return NextResponse.json({ 
      mandate: updatedMandate || allMandates[0], 
      mandates: allMandates, 
      success: true 
    });
  } catch (error: any) {
    console.error("Failed to update mandate:", error);
    return NextResponse.json(
      { error: "Failed to update mandate", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mandateId = url.searchParams.get("mandate_id");
    if (!mandateId) {
      return NextResponse.json({ error: "mandate_id query parameter is required" }, { status: 400 });
    }

    const db = getDb();
    const countResult = db.prepare("SELECT COUNT(*) as count FROM mandates").get() as { count: number };
    if (countResult.count <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last remaining active policy." },
        { status: 400 }
      );
    }

    const existing = db.prepare("SELECT * FROM mandates WHERE mandate_id = ?").get(mandateId) as MandateRow | undefined;
    const wasActive = existing ? (existing.status === "ACTIVE" || existing.status === "PARTIALLY_DEBITED") : false;

    db.prepare("DELETE FROM mandates WHERE mandate_id = ?").run(mandateId);

    if (wasActive) {
      const nextActive = db.prepare("SELECT mandate_id FROM mandates ORDER BY created_at DESC LIMIT 1").get() as any;
      if (nextActive) {
        db.prepare("UPDATE mandates SET status = 'ACTIVE' WHERE mandate_id = ?").run(nextActive.mandate_id);
      }
    }

    try {
      appendAuditNode({
        event_type: "MANDATE_DELETED",
        mandate_id: mandateId,
        timestamp: Date.now(),
      });
    } catch {}

    const allRows = db.prepare("SELECT * FROM mandates ORDER BY created_at DESC").all() as MandateRow[];
    const allMandates = allRows.map(mapRowToMandate);
    const activeMandate = allMandates.find((m) => m.status === "active" || m.status === "partially_debited") || allMandates[0];

    return NextResponse.json({
      success: true,
      deleted_id: mandateId,
      mandate: activeMandate,
      mandates: allMandates,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete mandate", details: error.message }, { status: 500 });
  }
}
