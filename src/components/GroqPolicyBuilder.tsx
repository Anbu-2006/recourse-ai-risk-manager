"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CornerDownLeft, Shield, SlidersHorizontal, CheckCircle2 } from "lucide-react";

export interface StagedDraft {
  mandate_id: string;
  category: string;
  per_item_cap_inr: number;
  daily_hold_inr: number;
  allowed_merchants: string[];
  schedule_days: string[];
  status: string;
}

interface GroqPolicyBuilderProps {
  onDraftCompiled: (draft: StagedDraft) => void;
  disabled?: boolean;
}

const PRESET_PROMPTS = [
  { label: "Groceries on ExaStore", prompt: "Only buy groceries on ExaStore under ₹1,000 limit" },
  { label: "Electronics on ExaStore", prompt: "Allow electronics purchases on ExaStore under ₹2,500 limit" },
  { label: "Pharmacy on ExaStore", prompt: "Allow pharmacy items on ExaStore under ₹800 limit" },
  { label: "Daily Essentials on ExaStore", prompt: "Allow daily essentials on ExaStore under ₹500 limit" },
];

export const GroqPolicyBuilder: React.FC<GroqPolicyBuilderProps> = ({
  onDraftCompiled,
  disabled = false,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCompile = async (overridePrompt?: string) => {
    const textToSubmit = overridePrompt ?? prompt;
    if (!textToSubmit.trim() || isCompiling || disabled) return;

    setIsCompiling(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/mandate/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSubmit.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to compile policy with Groq");
      }

      onDraftCompiled({
        mandate_id: data.mandate_id,
        category: data.draft.category,
        per_item_cap_inr: data.draft.per_item_cap_inr,
        daily_hold_inr: data.draft.initial_hold_inr || 2000,
        allowed_merchants: data.draft.allowed_merchants || ["ExaStore"],
        schedule_days: data.draft.schedule_days || ["Everyday"],
        status: data.draft.status || "PENDING_APPROVAL",
      });

      setPrompt("");
    } catch (err: any) {
      console.error("Groq compilation error:", err);
      setErrorMessage(err.message || "Compilation failed. Please try again.");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden card-ambient-glow">
      {/* Top accent badge & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              Groq Natural Language Policy Compiler
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                HITL GATED
              </span>
            </h2>
          </div>
        </div>
        <div className="text-[11.5px] text-slate-500 font-sans">
          Rules require your explicit verification before activating on UPI Reserve rails
        </div>
      </div>

      {/* Main interactive Prompt Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCompile();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your rule (e.g., 'Only buy groceries on weekends under ₹500 limit on Blinkit')..."
          disabled={isCompiling || disabled}
          className="w-full pl-3.5 pr-32 sm:pr-36 py-3 text-[13.5px] font-sans text-slate-900 bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
        />

        <div className="absolute right-1.5 flex items-center gap-1.5">
          <button
            type="submit"
            disabled={!prompt.trim() || isCompiling || disabled}
            className="btn-primary text-[12.5px] px-3.5 py-2 font-medium bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isCompiling ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span className="hidden sm:inline">Compiling...</span>
              </>
            ) : (
              <>
                <span>Compile</span>
                <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Prompt Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" /> Quick Presets:
        </span>
        {PRESET_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(item.prompt);
              handleCompile(item.prompt);
            }}
            disabled={isCompiling || disabled}
            className="text-[11px] font-sans px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 cursor-pointer transition-colors disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="mt-2.5 text-[12px] font-sans text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
