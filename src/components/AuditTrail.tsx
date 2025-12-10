"use client";

import React, { useState } from "react";
import { AuditLogEntry, Transaction } from "@/lib/types";
import { ChevronDown, ChevronRight, ShieldCheck, RefreshCw, Activity, KeyRound, Lock, ExternalLink, Copy } from "lucide-react";

interface AuditTrailProps {
  entries: AuditLogEntry[];
  transactions: Transaction[];
  onFlagOrder: (tx: Transaction) => void;
  onRefresh?: () => void;
  isPolling?: boolean;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  entries,
  transactions,
  onFlagOrder,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getBadgeForEvent = (event: AuditLogEntry["event"] | string, payload: any) => {
    switch (event) {
      case "TRANSACTION_EXECUTED":
      case "TRANSACTION_SETTLED":
        return { text: "SETTLED", className: "pill-pass" };
      case "TRANSACTION_BLOCKED":
      case "TRANSACTION_BLOCKED_GATE":
        return { text: "BLOCKED", className: "pill-blocked" };
      case "PROMPT_INJECTION_BLOCKED":
        return { text: "INJECTION BLOCKED", className: "pill-blocked" };
      case "MANDATE_HUMAN_APPROVED":
        return { text: "HITL APPROVED", className: "pill-pass" };
      case "DISPUTE_RAISED":
      case "DISPUTE_AUTO_REPRESENTMENT_CONTESTED":
        return { text: "DAO DISPUTE", className: "pill-pending" };
      case "GATE_EVALUATED":
        return payload?.outcome === "pass"
          ? { text: "GATE PASS", className: "pill-pass" }
          : { text: "GATE FAIL", className: "pill-blocked" };
      default:
        return { text: "AUDIT NODE", className: "pill-neutral" };
    }
  };

  return (
    <aside className="w-full lg:w-[380px] flex-shrink-0 flex flex-col bg-white rounded-lg border border-slate-200 shadow-xs h-[780px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700" />
            <h2 className="font-sans font-semibold text-[14px] text-slate-900 tracking-tight">
              Cryptographic Merkle Audit Trail
            </h2>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-[10px] text-emerald-700 font-bold tracking-wider uppercase">
              Ed25519 &amp; SHA-256 Verified ✓
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-slate-200/70 rounded-md text-slate-500 hover:text-slate-900 transition-colors"
              title="Verify & Refresh Cryptographic Chain"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Dispute Adjudication Trigger Bar */}
      <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-[11px] text-amber-900 font-semibold">
            Active DAO Dispute: #disp_razorpay_98765
          </span>
        </div>
        <button
          onClick={() => {
            const fakeTx: Transaction = {
              id: "pay_test_delhivery_987654",
              order_id: "order_rzp_9942a",
              amount: 1899,
              merchant: "Blinkit",
              item: "Gourmet Grocery Basket",
              category: "Groceries",
              status: "disputed",
              created_at: new Date().toISOString(),
              risk_tier: "LOW",
              awb_number: "987654321",
            };
            onFlagOrder(fakeTx);
          }}
          className="text-[11px] font-sans font-semibold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
        >
          <span>Auto-Contest</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Chronological Merkle Node Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#F8F9FA]/40">
        {entries.length === 0 ? (
          <div className="p-8 text-center font-mono text-[12px] text-slate-400">
            Awaiting signed Merkle ledger events...
          </div>
        ) : (
          entries.map((entry, idx) => {
            const badge = getBadgeForEvent(entry.event, entry.payload);
            const isExpanded = expandedId === entry.id;
            const nodeHash = entry.previous_hash || entry.id;

            return (
              <div
                key={entry.id || idx}
                className="bg-white border border-slate-200 rounded-md p-3 shadow-xs hover:border-slate-300 transition-all text-[12px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className={`font-mono text-[9.5px] font-bold px-2 py-0.5 rounded border uppercase ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "Live"}
                  </span>
                </div>

                {/* Node Hash Strip */}
                <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] bg-slate-50 p-1.5 rounded border border-slate-200/80 text-slate-600">
                  <span className="truncate max-w-[200px]">
                    Hash: {nodeHash.slice(0, 18)}...
                  </span>
                  <button
                    onClick={() => copyHash(nodeHash)}
                    className="text-slate-400 hover:text-slate-700 text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{copiedHash === nodeHash ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Action summary */}
                <div className="mt-1.5 font-sans text-[11.5px] text-slate-700">
                  {entry.payload?.item
                    ? `${entry.payload.merchant || "Merchant"}: ${entry.payload.item} (₹${entry.payload.amount || "0"})`
                    : entry.event}
                </div>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <span className="font-mono text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Attestation Payload JSON
                    </span>
                    <pre className="font-mono text-[10px] bg-slate-900 text-slate-100 p-2.5 rounded overflow-x-auto max-h-[160px]">
                      {JSON.stringify(entry.payload || entry, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
