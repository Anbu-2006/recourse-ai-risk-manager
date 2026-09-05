"use client";

import React from "react";
import { ShieldCheck, DollarSign, Award, Zap, ArrowRightLeft, Lock } from "lucide-react";

interface MetricsTickerProps {
  netCapitalPreserved?: number;
  winRate?: number;
  falsePositiveRate?: number;
  latencyMs?: number;
  merkleNodesCount?: number;
}

export const MetricsTicker: React.FC<MetricsTickerProps> = ({
  netCapitalPreserved = 144078,
  winRate = 92.0,
  falsePositiveRate = 0.0,
  latencyMs = 0.02,
  merkleNodesCount = 6,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-2.5 overflow-x-auto shadow-2xs">
      <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-6 min-w-[900px] text-[12px] font-mono">
        {/* Metric 1: Capital Preserved */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              Net Capital Preserved
            </span>
            <span className="text-slate-900 font-bold text-[13.5px]">
              ₹{netCapitalPreserved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Metric 2: DAO Win Rate */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Award className="w-4 h-4 text-blue-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              DAO Dispute Rebuttal
            </span>
            <span className="text-emerald-700 font-bold text-[13.5px]">
              {winRate.toFixed(1)}% Win Rate (Visa CE 3.0)
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Metric 3: RTO Hedging Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ArrowRightLeft className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              RTO Hedging Engine
            </span>
            <span className="text-amber-900 font-bold text-[13.5px]">
              Dynamic ₹49 Deposit Active
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Metric 4: Pass 1 Injection Latency */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 text-purple-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              Pass 1 Sanitizer
            </span>
            <span className="text-purple-900 font-bold text-[13.5px]">
              {latencyMs}ms Latency (&lt;2ms SLA)
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Metric 5: False Positive Rate */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              False Positive Rate
            </span>
            <span className="text-slate-900 font-bold text-[13.5px]">
              {falsePositiveRate.toFixed(1)}% (Limit &lt;0.8%)
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Metric 6: Merkle Ledger */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Lock className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              Merkle Ledger
            </span>
            <span className="text-emerald-700 font-bold text-[13.5px]">
              Ed25519 Verified ✓ ({merkleNodesCount} Nodes)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
