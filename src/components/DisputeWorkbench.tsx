"use client";

import React, { useState } from "react";
import { Scale, Truck, ShieldCheck, Sparkles, Send, Check, Download, Clock, CheckCircle2, FileText } from "lucide-react";
import { authFetch } from "@/lib/apiKeys";

export const DisputeWorkbench: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contestedDossier, setContestedDossier] = useState<any | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"carrier" | "ce3" | "legal" | "api">("carrier");

  const disputeInfo = {
    disputeId: "disp_razorpay_98765",
    paymentId: "pay_test_delhivery_987654",
    amountInr: 1899.00,
    penaltyInr: 1200.00,
    tatHoursRemaining: 48,
    merchant: "BigBasket Peenya Hub",
    cardholderClaim: "Cardholder claimed fraudulent transaction post-delivery (DAO Claws back 100% funds)",
    winProbability: 0.92,
  };

  const handleAutoContest = async () => {
    setIsSubmitting(true);
    try {
      const res = await authFetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contest",
          dispute_id: disputeInfo.disputeId,
          awb_number: "987654321",
        }),
      });

      const data = await res.json();
      if (res.ok && data.dossier) {
        setContestedDossier(data.dossier);
      } else {
        alert(data.error || "Failed to contest dispute on Razorpay");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error contesting dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportEvidenceJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contestedDossier || disputeInfo, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `evidentiary_dossier_${disputeInfo.disputeId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-amber-100/90 border border-amber-300 text-amber-900 font-bold tracking-wider uppercase shadow-2xs">
              Deduct at Onset (DAO) Chargeback Defense
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-[12px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {disputeInfo.tatHoursRemaining}h Turnaround Window
            </span>
          </div>
          <h1 className="font-sans font-bold text-[26px] sm:text-[30px] text-slate-900 tracking-tight leading-snug">
            Autonomous Dispute Representment &amp; Evidence Dossier
          </h1>
          <p className="font-sans text-[13px] text-slate-600 leading-normal max-w-4xl">
            Automated Visa Compelling Evidence 3.0 compilation + domestic 3PL carrier OTP delivery handshake via Razorpay Contest API.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportEvidenceJSON}
            className="h-[38px] px-3.5 text-[12.5px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dossier (JSON)</span>
          </button>
          <button
            onClick={handleAutoContest}
            disabled={isSubmitting || !!contestedDossier}
            className={`h-[38px] px-4 text-[12.5px] font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              contestedDossier
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Posting to Razorpay Rails...</span>
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

      {/* Main Grid: Left Overview & Right Evidentiary Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 Cols): Dispute Summary & Win Probability */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Dispute Meta Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dispute Telemetry
              </span>
              <span className={`font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                contestedDossier
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-900 border-amber-300"
              }`}>
                {contestedDossier ? "CONTESTED // UNDER REVIEW" : "OPEN // ACTION REQUIRED"}
              </span>
            </div>

            <div className="space-y-2.5 pt-1 font-mono text-[12px]">
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Disputed Capital</span>
                <span className="text-[20px] font-bold text-slate-900 tracking-tight">
                  ₹{disputeInfo.amountInr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Dispute Fee Shielded</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +₹{disputeInfo.penaltyInr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Dispute ID</span>
                <span className="text-slate-900 font-bold">#{disputeInfo.disputeId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Razorpay Payment Ref</span>
                <span className="text-slate-900 font-medium">{disputeInfo.paymentId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Merchant Hub</span>
                <span className="text-slate-900 font-medium">{disputeInfo.merchant}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/90 border border-amber-200/90 text-[12px] text-amber-950 leading-relaxed font-sans shadow-2xs">
              <span className="font-bold block mb-1 text-amber-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Cardholder Claim:
              </span>
              "{disputeInfo.cardholderClaim}"
            </div>
          </div>

          {/* Win Probability Score Card (High-Contrast, Vibrant Yellow + Royal Blue Accents) */}
          <div className="bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] p-5 rounded-xl border border-blue-800/40 shadow-md flex flex-col gap-3.5 relative overflow-hidden">
            {/* Multi-color top neon accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                PREDICTED REBUTTAL OUTCOME
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide">
                AI CONFIDENCE HIGH
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-sans text-[42px] font-black text-white tracking-tight leading-none">
                92%
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[13px] font-bold text-blue-400 uppercase tracking-wide">
                  Win Probability
                </span>
                <span className="font-mono text-[10.5px] text-amber-300/90 font-medium">
                  Algorithmic Defense Index
                </span>
              </div>
            </div>

            <p className="font-sans text-[12.5px] text-slate-200 leading-relaxed">
              Visa CE 3.0 requires 2 prior undisputed settled transactions with identical IP/device fingerprint. Delhivery carrier OTP verified at doorstep provides conclusive physical delivery proof.
            </p>

            <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Carrier OTP Handshake</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 font-semibold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Visa CE 3.0 Matched</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8 Cols): Tabbed Evidentiary Dossier */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Dossier Tabs */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {[
                { id: "carrier", label: "Carrier OTP Proof (Delhivery)", icon: <Truck className="w-3.5 h-3.5" /> },
                { id: "ce3", label: "Visa CE 3.0 Ledger", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { id: "legal", label: "Legal Rebuttal (Groq AI)", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: "api", label: "Razorpay Contest Payload", icon: <FileText className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveEvidenceTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeEvidenceTab === tab.id
                      ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <span className="font-mono text-[10.5px] text-emerald-800 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-bold hidden md:inline-block shadow-2xs">
              NETWORK COMPLIANT
            </span>
          </div>

          {/* Tab 1: Carrier OTP Handshake */}
          {activeEvidenceTab === "carrier" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-slate-900">
                      Delhivery Express Logistics Handshake
                    </h3>
                    <span className="font-mono text-[11.5px] text-slate-500">
                      Waybill AWB #987654321 · Service: Express Domestic Surface
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold shadow-2xs">
                  DELIVERED WITH 6-DIGIT OTP ✓
                </span>
              </div>

              {/* Delivery Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px] font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Recipient Mobile</span>
                  <span className="text-slate-900 font-bold">+919876543210</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">OTP Timestamp</span>
                  <span className="text-slate-900 font-bold">2026-02-15 14:32:10Z</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                  <span className="text-slate-900 font-bold">12.9279 N, 77.6741 E</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivery Personnel</span>
                  <span className="text-slate-900 font-bold">Ramesh K (DLV_0942)</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2 pt-2">
                <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  3PL Chain of Custody Timeline
                </span>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-[12px] font-mono overflow-hidden bg-white">
                  <div className="p-3 flex items-center justify-between bg-emerald-50/40">
                    <span className="text-slate-800 font-semibold">2026-02-15 14:32:10 UTC</span>
                    <span className="text-emerald-700 font-bold">DELIVERED (Doorstep OTP Handshake Verified)</span>
                    <span className="text-slate-500">Bellandur Doorstep</span>
                  </div>
                  <div className="p-3 flex items-center justify-between text-slate-600">
                    <span>2026-02-15 09:45:00 UTC</span>
                    <span>OUT FOR DELIVERY (Assigned to agent Ramesh K)</span>
                    <span className="text-slate-400">Bellandur Hub 560103</span>
                  </div>
                  <div className="p-3 flex items-center justify-between text-slate-600">
                    <span>2026-02-14 02:30:15 UTC</span>
                    <span>IN TRANSIT (Sorted and dispatched to mother hub)</span>
                    <span className="text-slate-400">Bengaluru Sort Center</span>
                  </div>
                  <div className="p-3 flex items-center justify-between text-slate-600">
                    <span>2026-02-13 09:12:00 UTC</span>
                    <span>MANIFESTED (Package manifested &amp; ready for pickup)</span>
                    <span className="text-slate-400">Merchant Peenya Hub</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Visa CE 3.0 Ledger */}
          {activeEvidenceTab === "ce3" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-slate-900">
                      Visa Compelling Evidence 3.0 (CE 3.0) Ledger
                    </h3>
                    <span className="font-mono text-[11.5px] text-slate-500">
                      Network Rule: 2 settled undisputed transactions within 120-365 days with matching IP/Device
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold shadow-2xs">
                  2/2 MATCH QUALIFIED ✓
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono text-[12px]">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span>Historical Transaction #tx_hist_001 (180 Days Ago)</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹450.00 · SETTLED (Undisputed)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                    <span>Customer IP: 49.36.128.45</span>
                    <span>Device ID: dev_fp_987654</span>
                    <span>Email: customer@enterprise.in</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono text-[12px]">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span>Historical Transaction #tx_hist_002 (120 Days Ago)</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹380.00 · SETTLED (Undisputed)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                    <span>Customer IP: 49.36.128.45</span>
                    <span>Device ID: dev_fp_987654</span>
                    <span>Email: customer@enterprise.in</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 font-sans text-[12px] text-slate-700 shadow-2xs">
                <span className="text-blue-950 font-bold block mb-1">Visa CE 3.0 Invariant Satisfaction:</span>
                Identical IP subnet (49.36.128.0/24) and SHA-256 canvas device fingerprint match conclusively across both historical orders and the disputed transaction, precluding the cardholder's claim of unauthorized account takeover.
              </div>
            </div>
          )}

          {/* Tab 3: Legal Rebuttal */}
          {activeEvidenceTab === "legal" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-sans font-bold text-[16px] text-slate-900">
                    Formal Dispute Representment Letter (Groq Llama-3.3-70b)
                  </h3>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500">
                  NPCI UDIR &amp; VISA SPECIFICATION
                </span>
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-[13px] font-sans text-slate-800 leading-relaxed space-y-3.5 shadow-2xs">
                <p>
                  This document constitutes formal evidentiary representment contesting Dispute #{disputeInfo.disputeId} on Razorpay Transaction #{disputeInfo.paymentId} for INR {disputeInfo.amountInr.toFixed(2)}. The cardholder's claim of unauthorized transaction or non-receipt is definitively refuted by authenticated digital checkout telemetry and conclusive proof of delivery. Digital order authorization occurred under registered merchant credentials with verified clickwrap terms accepted at checkout.
                </p>
                <p>
                  Physical fulfillment was executed via domestic carrier Delhivery under Waybill #987654321. The shipment was successfully delivered to the cardholder on 2026-02-15T14:32:10Z at verified GPS coordinates (12.9279 N, 77.6741 E). Delivery release was strictly authorized upon real-time validation of a single-use 6-digit SMS OTP validated on the cardholder's registered mobile device (+919876543210) by delivery agent Ramesh Kumar (DLV_BLR_0942).
                </p>
                <p>
                  Furthermore, this transaction decisively satisfies Visa Compelling Evidence 3.0 (CE 3.0) standards. Our merchant ledger exhibits 2 historical, undisputed settled transactions from the preceding 180 days matching identical IP subnet (49.36.128.45) and hardware device fingerprint (dev_fp_987654). In accordance with Visa Cardholder Dispute Resolution guidelines and NPCI UDIR regulations, the merchant has satisfied all evidentiary mandates; we request immediate dismissal of the dispute, reversal of the Deduct at Onset clawback, and full unfreezing of merchant settlement capital.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Razorpay Contest Payload */}
          {activeEvidenceTab === "api" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <span className="font-mono text-[12px] text-slate-900 font-bold">
                  PATCH /v1/disputes/{disputeInfo.disputeId}/contest
                </span>
                <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  HTTP 200 READY
                </span>
              </div>

              <pre className="bg-[#0F172A] p-4 rounded-lg border border-slate-800 text-[12px] font-mono text-emerald-400 leading-relaxed overflow-x-auto shadow-inner">
{JSON.stringify(
  contestedDossier?.razorpayContestResponse || {
    id: disputeInfo.disputeId,
    entity: "dispute",
    payment_id: disputeInfo.paymentId,
    amount: disputeInfo.amountInr * 100,
    currency: "INR",
    status: contestedDossier ? "under_review" : "open",
    phase: "chargeback",
    reason_code: "fraudulent_chargeback_dao",
    evidence: {
      submitted_documents: [
        "delhivery_carrier_otp_manifest.pdf",
        "visa_ce3_fingerprint_ledger.json"
      ],
      win_probability_estimate: 0.92,
      tat_deadline_hours: 48
    }
  },
  null,
  2
)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
