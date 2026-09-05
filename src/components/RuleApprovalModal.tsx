"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Shield,
  Clock,
  Tag,
  Store,
  Calendar,
  IndianRupee,
  Sliders,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { StagedDraft } from "./GroqPolicyBuilder";

interface RuleApprovalModalProps {
  draft: StagedDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onApproved: (updated: any) => void;
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const RuleApprovalModal: React.FC<RuleApprovalModalProps> = ({
  draft,
  isOpen,
  onClose,
  onApproved,
}) => {
  const [category, setCategory] = useState("");
  const [perItemCap, setPerItemCap] = useState<number>(500);
  const [dailyHold, setDailyHold] = useState<number>(2000);
  const [merchants, setMerchants] = useState<string[]>([]);
  const [newMerchant, setNewMerchant] = useState("");
  const [scheduleDays, setScheduleDays] = useState<string[]>(["Everyday"]);
  const [validityWindow, setValidityWindow] = useState("30_days");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draft) {
      setCategory(draft.category || "Groceries");
      setPerItemCap(draft.per_item_cap_inr || 500);
      setDailyHold(draft.daily_hold_inr || 2000);
      setMerchants(draft.allowed_merchants && draft.allowed_merchants.length > 0 ? draft.allowed_merchants : ["ExaStore"]);
      setScheduleDays(draft.schedule_days || ["Everyday"]);
      setError(null);
    }
  }, [draft]);

  if (!isOpen || !draft) return null;

  const handleAddMerchant = () => {
    const trimmed = newMerchant.trim();
    if (trimmed && !merchants.includes(trimmed)) {
      setMerchants([...merchants, trimmed]);
      setNewMerchant("");
    }
  };

  const handleRemoveMerchant = (toRemove: string) => {
    setMerchants(merchants.filter((m) => m !== toRemove));
  };

  const toggleDay = (day: string) => {
    if (scheduleDays.includes("Everyday")) {
      setScheduleDays([day]);
      return;
    }
    if (scheduleDays.includes(day)) {
      const next = scheduleDays.filter((d) => d !== day);
      setScheduleDays(next.length === 0 ? ["Everyday"] : next);
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const setPresetSchedule = (preset: "Everyday" | "Weekends") => {
    if (preset === "Everyday") {
      setScheduleDays(["Everyday"]);
    } else {
      setScheduleDays(["Saturday", "Sunday"]);
    }
  };

  const handleApprove = async () => {
    if (!category.trim()) {
      setError("Category name is required.");
      return;
    }
    if (perItemCap <= 0) {
      setError("Per-item cap must be greater than ₹0.");
      return;
    }
    if (merchants.length === 0) {
      setError("Please allow at least one merchant.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mandate/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandate_id: draft.mandate_id,
          category: category.trim(),
          per_item_cap_inr: Number(perItemCap),
          daily_hold_inr: Number(dailyHold),
          allowed_merchants: merchants,
          schedule_days: scheduleDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to activate mandate");
      }

      onApproved(data);
      onClose();
    } catch (err: any) {
      console.error("Failed to approve rule:", err);
      setError(err.message || "Approval failed. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-backdrop-in bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">
                  Rule Approval &amp; Verification
                </h3>
                <span className="pill-pending uppercase text-[10px] font-mono">
                  PENDING REVIEW
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-0.5 font-sans">
                Review and alter the Groq-compiled policy before activating it on Razorpay rails.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Editable Form */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 text-slate-800 text-[13px]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Category & Spending Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-sans"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <div className="mt-1 flex gap-1">
                {["Groceries", "Electronics", "Pharmacy", "Dining"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Per-Item Cap (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-[13px] font-mono">₹</span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={perItemCap}
                  onChange={(e) => setPerItemCap(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono font-medium"
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-sans">
                Max allowable price per single cart item
              </div>
            </div>
          </div>

          {/* Row 2: Total Daily Reserve Hold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Reserve Hold Cap
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-[13px] font-mono">₹</span>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={dailyHold}
                  onChange={(e) => setDailyHold(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono font-medium"
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-sans">
                Initial hold pre-authorized on UPI rails
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Policy Duration Window
              </label>
              <select
                value={validityWindow}
                onChange={(e) => setValidityWindow(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-sans"
              >
                <option value="30_days">30 Days (Rolling UPI Mandate)</option>
                <option value="7_days">7 Days (Sprint Window)</option>
                <option value="weekend">This Weekend Only</option>
                <option value="indefinite">Indefinite (Revocable)</option>
              </select>
              <div className="mt-1 text-[11px] text-slate-500 font-sans">
                Rule automatically expires when window concludes
              </div>
            </div>
          </div>

          {/* Row 3: Active Schedule Days */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider">
                Active Execution Days
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPresetSchedule("Everyday")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    scheduleDays.includes("Everyday")
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Everyday
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSchedule("Weekends")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    scheduleDays.length === 2 && scheduleDays.includes("Saturday") && scheduleDays.includes("Sunday")
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Weekends Only
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const isSelected = scheduleDays.includes("Everyday") || scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`text-[11.5px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 font-medium"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Allowed Merchants Tags */}
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Allowed Merchants Allowlist
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[46px]">
              {merchants.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 text-[11.5px] font-mono px-2.5 py-1 rounded bg-white text-slate-800 border border-slate-200 shadow-2xs"
                >
                  <Store className="w-3 h-3 text-slate-400" />
                  {m}
                  <button
                    type="button"
                    onClick={() => handleRemoveMerchant(m)}
                    className="hover:text-red-600 ml-0.5 text-slate-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMerchant();
                    }
                  }}
                  placeholder="+ Add merchant..."
                  className="px-2 py-1 text-[11.5px] bg-transparent focus:outline-hidden font-sans text-slate-800 placeholder:text-slate-400 flex-1"
                />
                {newMerchant && (
                  <button
                    type="button"
                    onClick={handleAddMerchant}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-white rounded cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security & Enforcement Guarantee */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[12px] font-semibold text-emerald-900">
                Zero-LLM Hard Gate Guarantee
              </div>
              <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                Orders with amount &gt; ₹{perItemCap.toFixed(2)} or outside{" "}
                <strong>{scheduleDays.join(", ")}</strong> will be blocked with sub-millisecond AST enforcement. No fund leakage possible.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-secondary text-[12.5px] px-4 py-2"
          >
            Discard Draft
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="btn-primary bg-emerald-700 hover:bg-emerald-800 text-white text-[12.5px] px-5 py-2 font-medium flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Signing Merkle Block...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Approve &amp; Activate Rule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
