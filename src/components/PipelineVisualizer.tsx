"use client";

import React from "react";
import { Zap, MapPin, Shield, CreditCard } from "lucide-react";

interface PipelineVisualizerProps {
  currentStage?: 1 | 2 | 3 | 4 | "idle";
  pass1Passed?: boolean;
  pass2Tier?: "LOW" | "MEDIUM" | "HIGH";
  pass3Passed?: boolean;
  pass4OrderId?: string;
  latencyMs?: number;
  adsScore?: number;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  currentStage = "idle",
  pass1Passed = true,
  pass2Tier = "LOW",
  pass3Passed = true,
  pass4OrderId,
  latencyMs = 0.02,
  adsScore = 0.92,
}) => {
  const steps = [
    {
      step: 1,
      name: "Pass 1: AST / Injection Sanitizer",
      subtitle: `${latencyMs}ms Regex Scan`,
      icon: <Zap className="w-3.5 h-3.5 text-purple-600" />,
      status: pass1Passed ? "PASS" : "INTERCEPTED",
      statusClass: pass1Passed
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      step: 2,
      name: "Pass 2: Address ADS Scorer",
      subtitle: `Score: ${(adsScore * 100).toFixed(0)}/100 · ${pass2Tier} Risk`,
      icon: <MapPin className="w-3.5 h-3.5 text-blue-600" />,
      status: pass2Tier === "LOW" ? "FREE COD" : pass2Tier === "MEDIUM" ? "+₹49 DEPOSIT" : "UPI HOLD",
      statusClass:
        pass2Tier === "LOW"
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : pass2Tier === "MEDIUM"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      step: 3,
      name: "Pass 3: Deterministic Hard Gate",
      subtitle: "Zero-LLM Caps & Merchant Mask",
      icon: <Shield className="w-3.5 h-3.5 text-emerald-600" />,
      status: pass3Passed ? "4/4 RULES PASSED" : "GATE BREACH",
      statusClass: pass3Passed
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      step: 4,
      name: "Pass 4: Razorpay Settlement Rails",
      subtitle: pass4OrderId ? `Order: ${pass4OrderId.slice(0, 15)}...` : "Live Test Mode",
      icon: <CreditCard className="w-3.5 h-3.5 text-indigo-600" />,
      status: pass3Passed && pass1Passed ? "INTENT CREATED" : "FUNDS PROTECTED",
      statusClass:
        pass3Passed && pass1Passed
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-slate-100 text-slate-600 border-slate-200",
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <span className="font-sans text-[11.5px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          Autonomous Pre-Payment Defense Pipeline
        </span>
        <span className="font-mono text-[10.5px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          EXECUTION MODEL: ZERO-TRUST IN-LINE GATE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div
            key={s.step}
            className="p-3 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs mt-0.5">
                {s.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-[12.5px] font-semibold text-slate-900 tracking-tight leading-tight truncate">
                  {s.name}
                </span>
                <span className="font-mono text-[11px] text-slate-500 truncate mt-0.5">
                  {s.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${s.statusClass}`}>
                {s.status}
              </span>
              <span className="font-mono text-[10.5px] text-slate-400">Step 0{s.step}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
