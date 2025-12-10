"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/types";
import { X, ShieldCheck, Truck, Scale, Sparkles, FileText, Check, Send, AlertTriangle } from "lucide-react";
import { authFetch } from "@/lib/apiKeys";

interface DisputeSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  disputeTx: Transaction | null;
  onDisputeContested?: (disputeId: string) => void;
}

export const DisputeSlideOver: React.FC<DisputeSlideOverProps> = ({
  isOpen,
  onClose,
  disputeTx,
  onDisputeContested,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contestedDossier, setContestedDossier] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleAutoContest = async () => {
    try {
      setIsSubmitting(true);
      const res = await authFetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contest",
          dispute_id: "disp_razorpay_98765",
          awb_number: "987654321",
        }),
      });

      const data = await res.json();
      if (data.success && data.dossier) {
        setContestedDossier(data.dossier);
        if (onDisputeContested) {
          onDisputeContested("disp_razorpay_98765");
        }
      }
    } catch (err) {
      console.error("Auto-contest error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div className="w-full max-w-[540px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl relative">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="pill-pending font-mono text-[10.5px] uppercase tracking-wider">
                DAO Chargeback Defense
              </span>
              <span className="font-mono text-[11px] text-slate-500">72h TAT Window</span>
            </div>
            <h2 className="font-sans font-semibold text-[17px] text-slate-900 tracking-tight">
              Evidentiary Representment Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Dispute Metadata Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-3 text-[12px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Dispute ID</span>
              <span className="text-slate-900 font-semibold">#disp_razorpay_98765</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Payment Ref</span>
              <span className="text-slate-900 font-medium">pay_test_delhivery_987654</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Amount Disputed</span>
              <span className="text-slate-900 font-bold text-[14px]">₹1,899.00</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Gateway Status</span>
              <span className="pill-pending text-[10px]">FROZEN (DAO CLAWBACK)</span>
            </div>
          </div>

          {/* Win Probability Hero Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-lg flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Predicted Defense Outcome
              </span>
              <span className="font-mono text-[22px] font-bold text-emerald-900">
                92% Win Probability
              </span>
              <span className="font-sans text-[11.5px] text-emerald-700">
                Visa Compelling Evidence 3.0 match + Carrier OTP handshake
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0 text-emerald-800">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          {/* Section 1: Carrier Delivery Proof (Delhivery) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-sans text-[12.5px] font-semibold">
                  Carrier Delivery Proof — Delhivery Express
                </span>
              </div>
              <span className="pill-pass text-[10.5px]">
                OTP VERIFIED ✓
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[9.5px]">WAYBILL / AWB</span>
                <span className="text-slate-900 font-medium">#987654321</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[9.5px]">DELIVERY TIMESTAMP</span>
                <span className="text-slate-900 font-medium">2026-02-15 14:32:10Z</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[9.5px]">RECIPIENT MOBILE</span>
                <span className="text-slate-900 font-medium">+919876543210</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[9.5px]">GPS COORDINATES</span>
                <span className="text-slate-900 font-medium">12.9279 N, 77.6741 E</span>
              </div>
            </div>
          </div>

          {/* Section 2: Visa Compelling Evidence 3.0 (CE 3.0) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-sans text-[12.5px] font-semibold">
                  Visa Compelling Evidence 3.0 (CE 3.0)
                </span>
              </div>
              <span className="pill-pass text-[10.5px]">
                4 PRIOR TXS MATCHED
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-700">
                <span>Tx #tx_hist_001 (180d ago): ₹450.00</span>
                <span className="text-slate-500">IP: 49.36.128.45 · Dev: dev_fp_987654</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-700">
                <span>Tx #tx_hist_002 (120d ago): ₹380.00</span>
                <span className="text-slate-500">IP: 49.36.128.45 · Dev: dev_fp_987654</span>
              </div>
            </div>
          </div>

          {/* Section 3: Synthesized Legal Rebuttal */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-sans text-[12.5px] font-semibold">
                  Synthesized Legal Rebuttal (Groq AI)
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                NPCI UDIR &amp; VISA FORMAT
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-[12px] font-sans text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto space-y-2">
              <p>
                This document constitutes formal evidentiary representment contesting Dispute #disp_razorpay_98765 on Razorpay Transaction #pay_test_delhivery_987654 for INR 1899.00. The cardholder's claim of unauthorized transaction is definitively refuted by authenticated digital checkout telemetry, cryptographically notarized Intent Receipt #intent_rcpt_9942a_verified, and conclusive proof of delivery.
              </p>
              <p>
                Physical fulfillment was executed via domestic carrier Delhivery under Waybill #987654321. The shipment was successfully delivered on 2026-02-15T14:32:10Z at GPS (12.9279 N, 77.6741 E). Delivery was authorized upon real-time validation of a 6-digit SMS OTP on the cardholder's registered device (+919876543210).
              </p>
              <p>
                Furthermore, this transaction satisfies Visa Compelling Evidence 3.0 (CE 3.0) standards with historical undisputed settled transactions matching IP 49.36.128.45 and hardware device fingerprint dev_fp_987654. We request immediate reversal of the DAO clawback and release of frozen merchant funds.
              </p>
            </div>
          </div>

          {/* Success Banner if contested */}
          {contestedDossier && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-[12px]">
                <span className="font-sans font-bold text-emerald-900">
                  Successfully Contested via Razorpay Contest API
                </span>
                <span className="font-mono text-[11px] text-emerald-800">
                  Gateway status updated to UNDER_REVIEW · Evidentiary bundle submitted to issuing bank.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary text-[12.5px] px-4 py-2"
          >
            Close
          </button>

          <button
            onClick={handleAutoContest}
            disabled={isSubmitting || !!contestedDossier}
            className={`btn-primary text-[12.5px] px-5 py-2 flex items-center gap-2 ${
              contestedDossier
                ? "bg-emerald-700 hover:bg-emerald-700 text-white cursor-default"
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Submitting to Razorpay Rails...</span>
              </>
            ) : contestedDossier ? (
              <>
                <Check className="w-4 h-4" />
                <span>Contested on Razorpay Rails ✓</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Auto-Contest via Razorpay API</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
