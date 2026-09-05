import { 
  Mandate, 
  Transaction, 
  GateCheck, 
  AuditLogEntry, 
  Dispute, 
  FaultClassification 
} from "./types";

class RecourseStore {
  private mandate: Mandate;
  private transactions: Map<string, Transaction> = new Map();
  private gateChecks: Map<string, GateCheck> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private disputes: Map<string, Dispute> = new Map();
  private classifications: Map<string, FaultClassification> = new Map();

  constructor() {
    // Initialize clean default active mandate
    this.mandate = {
      id: "mandate_groceries_001",
      category: "Groceries",
      per_item_cap: 3000,
      daily_hard_cap: 25000,
      merchant_allowlist: ["ExaStore"],
      spent_to_date: 0,
      time_window_start: "06:00",
      time_window_end: "23:00",
      status: "active",
      created_at: new Date().toISOString(),
    };

    // System initialized record
    this.appendAudit("mandate", this.mandate.id, "MANDATE_INITIALIZED", {
      category: this.mandate.category,
      per_item_cap: this.mandate.per_item_cap,
      daily_hard_cap: this.mandate.daily_hard_cap,
      allowlist: this.mandate.merchant_allowlist,
    });
  }

  public clearAllHistory(): void {
    this.transactions.clear();
    this.gateChecks.clear();
    this.auditLog = [];
    this.disputes.clear();
    this.classifications.clear();
    this.mandate.spent_to_date = 0;
  }

  // --- Mandate Operations ---
  public getMandate(): Mandate {
    return { ...this.mandate };
  }

  public updateMandate(updates: Partial<Mandate>): Mandate {
    this.mandate = { ...this.mandate, ...updates };
    this.appendAudit("mandate", this.mandate.id, "MANDATE_UPDATED", updates);
    return { ...this.mandate };
  }

  // --- Gate Check Operations ---
  public recordGateCheck(gateCheck: GateCheck): void {
    this.gateChecks.set(gateCheck.id, gateCheck);
    this.appendAudit("gate_check", gateCheck.id, "GATE_EVALUATED", {
      outcome: gateCheck.outcome,
      reason: gateCheck.reason,
      checks: gateCheck.rule_results,
    });
  }

  public getGateCheck(id: string): GateCheck | undefined {
    return this.gateChecks.get(id);
  }

  // --- Transaction Operations ---
  public createTransaction(tx: Transaction): Transaction {
    this.transactions.set(tx.id, tx);
    if (tx.status === "executed") {
      this.mandate.spent_to_date += tx.amount;
      this.appendAudit("transaction", tx.id, "TRANSACTION_EXECUTED", {
        amount: tx.amount,
        merchant: tx.merchant,
        item: tx.item_description,
        spent_to_date: this.mandate.spent_to_date,
      });
    } else {
      this.appendAudit("transaction", tx.id, "TRANSACTION_BLOCKED", {
        amount: tx.amount,
        merchant: tx.merchant,
        item: tx.item_description,
        reason: "Hard Gate boundary breach",
      });
    }
    return tx;
  }

  public getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  public getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public updateTransactionStatus(id: string, status: Transaction["status"]): void {
    const tx = this.transactions.get(id);
    if (tx) {
      tx.status = status;
      this.transactions.set(id, tx);
    }
  }

  // --- Dispute Operations ---
  public createDispute(dispute: Dispute): Dispute {
    // Unique constraint: one active dispute per transaction (Idempotency)
    const existing = Array.from(this.disputes.values()).find(
      (d) => d.transaction_id === dispute.transaction_id
    );
    if (existing) {
      return existing;
    }

    this.disputes.set(dispute.id, dispute);
    const tx = this.transactions.get(dispute.transaction_id);
    if (tx) {
      tx.dispute_id = dispute.id;
      tx.status = "pending_review";
    }

    this.appendAudit("dispute", dispute.id, "DISPUTE_RAISED", {
      transaction_id: dispute.transaction_id,
      user_statement: dispute.user_statement,
      status: dispute.status,
    });
    return dispute;
  }

  public recordFaultClassification(fc: FaultClassification): void {
    this.classifications.set(fc.id, fc);
    const dispute = this.disputes.get(fc.dispute_id);
    if (dispute) {
      dispute.classification = fc;
      if (fc.reversal_action === "auto_reverse") {
        dispute.status = "reversed";
        this.updateTransactionStatus(dispute.transaction_id, "reversed");
        // Decrement spent_to_date
        const tx = this.transactions.get(dispute.transaction_id);
        if (tx) {
          this.mandate.spent_to_date = Math.max(0, this.mandate.spent_to_date - tx.amount);
        }
        this.appendAudit("dispute", dispute.id, "REVERSAL_EXECUTED", {
          classification: fc.classification,
          confidence: fc.confidence,
          reversal_amount: tx?.amount,
        });
      } else if (fc.reversal_action === "merchant_queue") {
        dispute.status = "escalated";
        this.appendAudit("dispute", dispute.id, "ESCALATION_ROUTED", {
          queue: "MERCHANT_SLA_QUEUE",
          classification: fc.classification,
          confidence: fc.confidence,
        });
      } else if (fc.reversal_action === "security_freeze") {
        dispute.status = "escalated";
        this.mandate.status = "frozen";
        this.appendAudit("mandate", this.mandate.id, "MANDATE_UPDATED", {
          status: "frozen",
          reason: "Security compromise detected in dispute classification",
        });
      } else {
        dispute.status = "rejected";
      }

      this.appendAudit("dispute", fc.id, "FAULT_CLASSIFIED", {
        dispute_id: fc.dispute_id,
        classification: fc.classification,
        confidence: fc.confidence,
        reversal_action: fc.reversal_action,
        reasoning: fc.reasoning,
      });
    }
  }

  public getDisputeByTransactionId(txId: string): Dispute | undefined {
    return Array.from(this.disputes.values()).find((d) => d.transaction_id === txId);
  }

  public getDispute(id: string): Dispute | undefined {
    return this.disputes.get(id);
  }

  // --- Append-Only Audit Log ---
  public appendAudit(
    entity_type: AuditLogEntry["entity_type"],
    entity_id: string,
    event: AuditLogEntry["event"],
    payload: Record<string, any>,
    timestamp?: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entity_type,
      entity_id,
      event,
      payload,
      timestamp: timestamp || new Date().toISOString(),
    };
    this.auditLog.push(entry);
    return entry;
  }

  public getAuditLog(limit = 100, offset = 0): { entries: AuditLogEntry[]; total: number } {
    const reversed = [...this.auditLog].reverse();
    return {
      entries: reversed.slice(offset, offset + limit),
      total: this.auditLog.length,
    };
  }

  // Helper for demo reset
  public resetToDefault(): void {
    this.transactions.clear();
    this.gateChecks.clear();
    this.disputes.clear();
    this.classifications.clear();
    this.auditLog = [];
    this.mandate = {
      id: "man_default_groceries",
      category: "Groceries",
      per_item_cap: 500,
      daily_hard_cap: 5000,
      merchant_allowlist: ["BigBasket", "Blinkit", "Zepto", "Swiggy Instamart"],
      spent_to_date: 0,
      time_window_start: "06:00",
      time_window_end: "23:00",
      status: "active",
      created_at: new Date().toISOString(),
    };
    this.appendAudit("mandate", this.mandate.id, "MANDATE_INITIALIZED", {
      category: this.mandate.category,
      per_item_cap: this.mandate.per_item_cap,
      daily_hard_cap: this.mandate.daily_hard_cap,
      allowlist: this.mandate.merchant_allowlist,
    });
  }
}

// Global singleton for Next.js hot reload safety
const globalForStore = globalThis as unknown as { recourseStore: RecourseStore };
export const recourseStore = globalForStore.recourseStore || new RecourseStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.recourseStore = recourseStore;
}
