export type GateOutcome = "pass" | "fail";
export type TransactionStatus = "executed" | "blocked" | "reversed" | "pending_review" | "disputed";
export type FaultClassificationType = 
  | "agent_overreach" 
  | "unclear_instruction" 
  | "merchant_fulfillment_error" 
  | "security_compromise" 
  | "no_fault";

export interface Mandate {
  id: string;
  category: string;
  per_item_cap: number;
  daily_hard_cap: number;
  merchant_allowlist: string[];
  schedule_days?: string[];
  spent_to_date: number;
  residual_balance?: number;
  initial_hold?: number;
  user_vpa?: string;
  time_window_start?: string; // ISO or HH:mm
  time_window_end?: string;   // ISO or HH:mm
  status: string;
  created_at: string;
  rto_policy?: {
    ads_low_threshold: number;
    ads_medium_threshold: number;
    reservation_deposit_inr: number;
    reserve_pay_hold_inr: number;
  };
}

export interface ProposedTransaction {
  merchant: string;
  item: string;
  amount: number;
  category: string;
}

export interface RuleResults {
  category: boolean;
  cap: boolean;
  merchant: boolean;
  time: boolean;
}

export interface GateCheck {
  id: string;
  transaction_id?: string;
  mandate_snapshot: Mandate;
  rule_results: RuleResults;
  outcome: GateOutcome;
  reason: string;
  checked_at: string;
}

export interface Transaction {
  id: string;
  mandate_id?: string;
  merchant: string;
  item_description?: string;
  amount: number;
  category: string;
  status: TransactionStatus;
  gate_check_id?: string;
  created_at: string;
  dispute_id?: string;
  order_id?: string;
  item?: string;
  risk_tier?: string;
  awb_number?: string;
}

export interface AuditLogEntry {
  id: string;
  entity_type: "mandate" | "transaction" | "gate_check" | "dispute" | "system";
  entity_id: string;
  event: 
    | "MANDATE_INITIALIZED" 
    | "MANDATE_UPDATED" 
    | "GATE_EVALUATED" 
    | "TRANSACTION_EXECUTED" 
    | "TRANSACTION_BLOCKED" 
    | "DISPUTE_RAISED" 
    | "FAULT_CLASSIFIED" 
    | "REVERSAL_EXECUTED" 
    | "ESCALATION_ROUTED"
    | "AGENT_PARSE_ERROR"
    | string;
  payload: Record<string, any>;
  timestamp: string;
  previous_hash?: string;
  node_hash?: string;
}

export interface Dispute {
  id: string;
  transaction_id: string;
  user_statement: string;
  status: "in_triage" | "classified" | "reversed" | "escalated" | "rejected";
  raised_at: string;
  classification?: FaultClassification;
}

export interface FaultClassification {
  id: string;
  dispute_id: string;
  classification: FaultClassificationType;
  confidence: number; // 0 to 100
  reasoning: string;
  evidence_refs: string[];
  reversal_action: "auto_reverse" | "merchant_queue" | "security_freeze" | "none";
  classified_at: string;
}

export interface EvaluationScenario {
  id: string;
  prompt: string;
  mandate_constraint: string;
  proposed_transaction: ProposedTransaction;
  true_label: FaultClassificationType;
  predicted_label?: FaultClassificationType;
  match?: boolean;
  latency_ms?: number;
  reasoning?: string;
}
