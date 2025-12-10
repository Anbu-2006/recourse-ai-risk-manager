"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Check } from "lucide-react";
import { authFetch } from "@/lib/apiKeys";

interface PendingMandateData {
  id: string;
  category: string;
  per_item_cap: number;
  daily_hard_cap: number;
  merchant_allowlist: string[];
  status: string;
  created_at: string;
}

interface MandateReviewCardProps {
  pendingMandate: PendingMandateData | null;
  onMandateApproved?: () => void;
}

export const MandateReviewCard: React.FC<MandateReviewCardProps> = ({
  pendingMandate,
  onMandateApproved,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [approvedId, setApprovedId] = useState<string | null>(null);

  if (!pendingMandate || approvedId === pendingMandate.id) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await authFetch("/api/mandate/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mandate_id: pendingMandate.id }),
      });

      if (res.ok) {
        setApprovedId(pendingMandate.id);
        onMandateApproved?.();
      }
    } catch (err) {
      console.error("Failed to approve mandate:", err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 pb-4">
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-[14px] text-amber-900">
                  Action Required: Human-in-the-Loop (HITL) Policy Staging Approval
                </span>
                <span className="pill-pending uppercase font-mono text-[10px]">
                  FAIL-CLOSED ACTIVE
                </span>
              </div>
              <p className="text-[12.5px] font-sans text-amber-800 leading-relaxed">
                A new spending policy draft was compiled via Groq AI. All incoming transactions for this category are currently <strong>fail-closed</strong> until human authorization is granted.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-amber-900">
                <span className="px-2 py-0.5 rounded bg-amber-100/80 border border-amber-200">
                  Category: <strong>{pendingMandate.category}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100/80 border border-amber-200">
                  Item Cap: <strong>≤ ₹{pendingMandate.per_item_cap.toFixed(2)}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100/80 border border-amber-200">
                  Merchants: <strong>{pendingMandate.merchant_allowlist.join(", ")}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn-primary bg-amber-900 hover:bg-amber-950 text-white text-[12.5px] font-medium px-4 py-2"
            >
              {isApproving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Activating Policy...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve &amp; Activate Policy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
