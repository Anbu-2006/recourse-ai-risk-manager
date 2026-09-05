"use client";

import React from "react";
import { DollarSign, Award, ShieldCheck, Database, ArrowUpRight } from "lucide-react";

interface MetricBannerProps {
  netCapitalPreserved?: number;
  winRate?: number;
  rtoHedgingPaisa?: number;
  merkleNodesCount?: number;
}

export const MetricBanner: React.FC<MetricBannerProps> = ({
  netCapitalPreserved = 144078.0,
  winRate = 92.0,
  rtoHedgingPaisa = 4900,
  merkleNodesCount = 13,
}) => {
  return (
    <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Capital Preserved */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 font-sans">
              Net Capital Preserved
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-mono font-bold text-slate-900 tracking-tight">
              ₹{netCapitalPreserved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11.5px] font-sans text-emerald-700">
              <ArrowUpRight className="w-3 h-3" />
              <span>0.0% False Positive Rate SLA</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dispute Rebuttal Win Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 font-sans">
              Dispute Rebuttal Win Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-mono font-bold text-slate-900 tracking-tight">
              {winRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11.5px] font-sans text-slate-600">
              <span>Visa CE 3.0 & Carrier OTP Verified</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic RTO Hedging */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 font-sans">
              Dynamic RTO Hedging
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-mono font-bold text-slate-900 tracking-tight">
              +₹{(rtoHedgingPaisa / 100).toFixed(0)} Deposit
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11.5px] font-sans text-amber-700">
              <span>Dynamic UPI Reservation Hold</span>
            </div>
          </div>
        </div>

        {/* Card 4: Audit Ledger Integrity */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 font-sans">
              Audit Ledger Integrity
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-mono font-bold text-slate-900 tracking-tight">
              {merkleNodesCount} Blocks Linked
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11.5px] font-sans text-slate-600">
              <span>Ed25519 & PGE Token Attested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
