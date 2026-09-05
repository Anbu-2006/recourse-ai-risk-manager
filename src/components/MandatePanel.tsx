"use client";

import React, { useState, useTransition } from "react";
import { Mandate } from "@/lib/types";
import { 
  Lock, 
  Sliders, 
  Shield, 
  ArrowRightLeft, 
  Check, 
  Plus, 
  X, 
  ChevronDown, 
  Building2, 
  Calendar, 
  CreditCard,
  RefreshCw,
  History,
  AlertCircle,
  Pencil,
  Trash2,
  Store,
  CheckCircle2
} from "lucide-react";

interface MandatePanelProps {
  mandate: Mandate;
  allMandates?: Mandate[];
  pendingMandate?: any | null;
  onUpdateMandate: (updates: Partial<Mandate> & { 
    action?: string; 
    mandate_id?: string; 
    reload_amount?: number; 
    reset_balance?: boolean;
    reservation_deposit_inr?: number;
    deposit_inr?: number;
    daily_hard_cap?: number;
  }) => Promise<void>;
  onSelectMandate?: (mandateId: string) => Promise<void>;
  onTriggerReviewModal?: () => void;
}

const COMMON_MERCHANT_PRESETS = [
  "ExaStore"
];

export const MandatePanel: React.FC<MandatePanelProps> = ({
  mandate,
  allMandates = [],
  pendingMandate,
  onUpdateMandate,
  onSelectMandate,
  onTriggerReviewModal,
}) => {
  const [isPending, startTransition] = useTransition();
  const [newMerchantInput, setNewMerchantInput] = useState("");
  const [isAddingMerchant, setIsAddingMerchant] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Editable amounts state
  const [isEditingCap, setIsEditingCap] = useState(false);
  const [editCapInput, setEditCapInput] = useState<string>(String(mandate.per_item_cap));

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetInput, setEditBudgetInput] = useState<string>(String(mandate.daily_hard_cap));

  // Editable RTO deposit amount state
  const [isEditingDeposit, setIsEditingDeposit] = useState(false);
  const currentDeposit = mandate.rto_policy?.reservation_deposit_inr ?? 49;
  const [depositInput, setDepositInput] = useState<string>(String(currentDeposit));

  // Delete Policy Confirmation modal / dialog state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const spentPercentage = Math.min(
    100,
    Math.round((mandate.spent_to_date / (mandate.daily_hard_cap || 1)) * 100)
  );

  const remaining = Math.max(0, mandate.daily_hard_cap - mandate.spent_to_date);
  const isActive = mandate.status === "active" || mandate.status === "partially_debited";

  // Show a temporary flash message
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Add Merchant to Allowlist
  const handleAddMerchant = async (merchantToAdd?: string) => {
    const name = (merchantToAdd || newMerchantInput).trim();
    if (!name) return;

    // Avoid case-insensitive duplicates
    if (mandate.merchant_allowlist.some((m) => m.toLowerCase() === name.toLowerCase())) {
      triggerNotice(`"${name}" is already in the allowlist.`);
      setNewMerchantInput("");
      return;
    }

    const updated = [...mandate.merchant_allowlist, name];
    setNewMerchantInput("");
    setIsAddingMerchant(false);

    startTransition(async () => {
      try {
        await onUpdateMandate({
          mandate_id: mandate.id,
          merchant_allowlist: updated,
        });
        triggerNotice(`Added "${name}" to allowlist · Synced to SQLite`);
      } catch (e) {
        console.error("Failed to add merchant:", e);
      }
    });
  };

  // Remove Merchant from Allowlist
  const handleRemoveMerchant = async (merchantToRemove: string) => {
    const updated = mandate.merchant_allowlist.filter(
      (m) => m.toLowerCase() !== merchantToRemove.toLowerCase()
    );

    startTransition(async () => {
      try {
        await onUpdateMandate({
          mandate_id: mandate.id,
          merchant_allowlist: updated,
        });
        triggerNotice(`Removed "${merchantToRemove}" · Synced to SQLite`);
      } catch (e) {
        console.error("Failed to remove merchant:", e);
      }
    });
  };

  // Reset to ExaStore Only (Default Store)
  const handleResetToExaStoreOnly = async () => {
    startTransition(async () => {
      try {
        await onUpdateMandate({
          mandate_id: mandate.id,
          merchant_allowlist: ["ExaStore"],
        });
        triggerNotice("Set ExaStore as the sole approved store in SQLite");
      } catch (e) {
        console.error("Failed to reset merchants:", e);
      }
    });
  };

  // Save Edited Per-Item Cap
  const handleSaveCap = async () => {
    const capNum = parseFloat(editCapInput);
    if (isNaN(capNum) || capNum <= 0) {
      triggerNotice("Please enter a valid cap amount");
      return;
    }

    setIsEditingCap(false);
    startTransition(async () => {
      try {
        await onUpdateMandate({
          mandate_id: mandate.id,
          per_item_cap: capNum,
        });
        triggerNotice(`Updated Per-Item Cap to ₹${capNum.toLocaleString("en-IN")}`);
      } catch (e) {
        console.error("Failed to update cap:", e);
      }
    });
  };

  // Save Edited Budget Pool
  const handleSaveBudget = async () => {
    const budgetNum = parseFloat(editBudgetInput);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      triggerNotice("Please enter a valid budget amount");
      return;
    }

    setIsEditingBudget(false);
    startTransition(async () => {
      try {
        await onUpdateMandate({
          mandate_id: mandate.id,
          daily_hard_cap: budgetNum,
        });
        triggerNotice(`Updated Reserve Budget to ₹${budgetNum.toLocaleString("en-IN")}`);
      } catch (e) {
        console.error("Failed to update budget:", e);
      }
    });
  };

  // Save Edited RTO Medium Risk Deposit Amount
  const handleSaveDeposit = async () => {
    const depNum = parseFloat(depositInput);
    if (isNaN(depNum) || depNum < 0) {
      triggerNotice("Please enter a valid deposit amount");
      return;
    }

    setIsEditingDeposit(false);
    startTransition(async () => {
      try {
        await onUpdateMandate({
          reservation_deposit_inr: depNum,
          deposit_inr: depNum,
        });
        triggerNotice(`Updated RTO medium-risk deposit to ₹${depNum}`);
      } catch (e) {
        console.error("Failed to update RTO deposit:", e);
      }
    });
  };

  // Delete Policy from SQLite
  const handleDeletePolicy = async (idToDelete: string) => {
    if (allMandates.length <= 1) {
      triggerNotice("Cannot delete the last remaining policy.");
      setConfirmDeleteId(null);
      return;
    }

    setConfirmDeleteId(null);
    startTransition(async () => {
      try {
        await onUpdateMandate({
          action: "DELETE",
          mandate_id: idToDelete,
        });
        triggerNotice(`Permanently deleted policy ${idToDelete} from SQLite`);
      } catch (e) {
        console.error("Failed to delete policy:", e);
      }
    });
  };

  // Activate Currently Selected Mandate
  const handleActivateCurrentMandate = async () => {
    startTransition(async () => {
      try {
        await onUpdateMandate({
          action: "ACTIVATE",
          mandate_id: mandate.id,
        });
        triggerNotice(`Policy ${mandate.id} is now ACTIVE on transaction rails.`);
      } catch (e) {
        console.error("Failed to activate policy:", e);
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Pending Staged Policy Action Notice (if staged via HITL) */}
      {pendingMandate && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-amber-950 flex items-center gap-2">
                Staged Policy Awaiting Human-in-the-Loop Review
                <span className="pill-pending text-[10px] font-mono">FAIL-CLOSED</span>
              </div>
              <p className="text-[12px] text-amber-800 mt-0.5 font-sans">
                Groq synthesized a new spending rule: <strong>{pendingMandate.category}</strong> with ₹{pendingMandate.per_item_cap} per-item cap on ExaStore.
              </p>
            </div>
          </div>
          {onTriggerReviewModal && (
            <button
              type="button"
              onClick={onTriggerReviewModal}
              className="bg-amber-900 hover:bg-amber-950 text-white text-[12px] px-4 py-2 rounded-lg font-semibold shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              Review &amp; Alter Rule
            </button>
          )}
        </div>
      )}

      {/* 2. Institutional Mandate Selector & Switcher Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Mandate Policy Switcher
              </span>
              <span className="text-[13px] font-semibold text-slate-900">
                Active &amp; Historical Mandates ({allMandates.length || 1} in SQLite)
              </span>
            </div>
          </div>

          {/* Mandate Dropdown Selector */}
          <div className="relative inline-block mt-1 sm:mt-0">
            <select
              value={mandate.id}
              onChange={(e) => {
                if (onSelectMandate) {
                  onSelectMandate(e.target.value);
                  setEditCapInput("");
                  setIsEditingCap(false);
                }
              }}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-900 font-mono text-[12px] font-semibold rounded-lg pl-3 pr-8 py-2 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 cursor-pointer transition-colors shadow-xs"
              aria-label="Select policy mandate to view or edit"
            >
              {allMandates.length > 0 ? (
                allMandates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.category} · ₹{m.per_item_cap.toLocaleString("en-IN")} cap ({m.status.toUpperCase()})
                  </option>
                ))
              ) : (
                <option value={mandate.id}>
                  {mandate.category} · ₹{mandate.per_item_cap.toLocaleString("en-IN")} cap ({mandate.status.toUpperCase()})
                </option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Status Badge, Activate CTA, and Delete Rule Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-mono font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE RAIL POLICY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold border border-slate-200">
                INACTIVE (STANDBY)
              </span>
              <button
                type="button"
                onClick={handleActivateCurrentMandate}
                disabled={isPending}
                className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Activate as Active Policy
              </button>
            </div>
          )}

          {/* Delete Current Policy Button */}
          {allMandates.length > 1 && (
            confirmDeleteId === mandate.id ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg animate-fadeIn">
                <span className="text-[11px] text-rose-700 font-semibold px-1.5">Delete rule?</span>
                <button
                  type="button"
                  onClick={() => handleDeletePolicy(mandate.id)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold px-2 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-slate-500 hover:text-slate-800 text-[11px] px-2 py-1 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(mandate.id)}
                disabled={isPending}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Permanently remove/delete this policy from SQLite"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Policy
              </button>
            )
          )}

          {actionNotice && (
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-fadeIn">
              {actionNotice}
            </span>
          )}
        </div>
      </div>

      {/* 3. Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Selected Mandate Details & Editable Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-sans text-[13px] font-bold text-slate-900 tracking-tight">
                  Policy Specification: {mandate.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">
                  ID: {mandate.id}
                </span>
              </div>
            </div>
            <span className={`font-mono text-[11px] uppercase flex items-center gap-1 font-bold px-2.5 py-1 rounded border ${
              isActive 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              <Lock className="w-3 h-3" />
              {mandate.status.toUpperCase()}
            </span>
          </div>

          {/* Key Policy Parameters Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* NPCI Rail VPA */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-mono uppercase text-slate-500 block font-semibold">
                NPCI Virtual Payment Address
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[12.5px] font-mono font-bold text-slate-900">
                  {mandate.user_vpa || "anbuselvan@upi"}
                </span>
              </div>
            </div>

            {/* Authorized Category */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-mono uppercase text-slate-500 block font-semibold">
                Authorized Category
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[12.5px] font-mono font-bold text-slate-900">
                  {mandate.category}
                </span>
              </div>
            </div>

            {/* Per-Item Hard Cap (EDITABLE AMOUNT) */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono uppercase text-slate-500 block font-semibold">
                  Per-Item Hard Cap (Pass 3)
                </span>
                {!isEditingCap && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditCapInput(String(mandate.per_item_cap));
                      setIsEditingCap(true);
                    }}
                    className="text-[10.5px] font-sans font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    title="Edit cap amount"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Cap
                  </button>
                )}
              </div>

              {isEditingCap ? (
                <div className="flex items-center gap-1.5 mt-1.5 animate-fadeIn">
                  <span className="text-[13px] font-mono font-bold text-slate-700">₹</span>
                  <input
                    type="number"
                    value={editCapInput}
                    onChange={(e) => setEditCapInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveCap();
                      if (e.key === "Escape") setIsEditingCap(false);
                    }}
                    className="w-28 bg-white border border-slate-300 text-slate-900 font-mono text-[14px] font-bold px-2 py-1 rounded focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveCap}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-2 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCap(false)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] px-1.5 py-1 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-[16px] font-mono font-bold text-slate-900 mt-0.5">
                  ₹{mandate.per_item_cap.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            {/* Execution Schedule */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-mono uppercase text-slate-500 block font-semibold">
                Execution Days
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[12px] font-mono font-medium text-slate-800">
                  {mandate.schedule_days && mandate.schedule_days.length > 0
                    ? mandate.schedule_days.join(", ")
                    : "Everyday"}
                </span>
              </div>
            </div>
          </div>

          {/* Reserve Pay Budget & Progress (EDITABLE AMOUNT) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-sans text-[12px] font-bold text-slate-900 block">Reserve Pay Budget Pool</span>
                <span className="text-[11px] text-slate-500 font-sans">Pre-authorized liquidity on NPCI Reserve rails</span>
              </div>

              {isEditingBudget ? (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-[13px] font-mono font-bold text-slate-700">₹</span>
                  <input
                    type="number"
                    value={editBudgetInput}
                    onChange={(e) => setEditBudgetInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveBudget();
                      if (e.key === "Escape") setIsEditingBudget(false);
                    }}
                    className="w-32 bg-white border border-slate-300 text-slate-900 font-mono text-[14px] font-bold px-2 py-1 rounded focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveBudget}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-2 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] px-1.5 py-1 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[16px] font-bold text-slate-900">
                    ₹{mandate.daily_hard_cap.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditBudgetInput(String(mandate.daily_hard_cap));
                      setIsEditingBudget(true);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                    title="Edit total budget pool"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full transition-all duration-500 ${
                  spentPercentage > 85 ? "bg-rose-500" : "bg-slate-900"
                }`}
                style={{ width: `${spentPercentage}%` }}
              />
            </div>

            <div className="flex justify-between font-mono text-[11.5px] text-slate-600 pt-0.5">
              <span>Settled: ₹{mandate.spent_to_date.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({spentPercentage}%)</span>
              <span className="font-semibold text-emerald-700">
                Residual Balance: ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Quick Budget Management Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={async () => {
                  await onUpdateMandate({
                    mandate_id: mandate.id,
                    reload_amount: 10000,
                  });
                  triggerNotice("Added ₹10,000 liquidity to reserve budget");
                }}
                className="flex-1 text-[11.5px] font-semibold py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer text-center shadow-2xs"
              >
                + Reload ₹10,000 Budget
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={async () => {
                  await onUpdateMandate({
                    mandate_id: mandate.id,
                    reset_balance: true,
                  });
                  triggerNotice("Reset mandate balance to initial hold");
                }}
                className="text-[11.5px] font-semibold py-2 px-3 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>

          {/* =========================================================
              4. EDITABLE ALLOWLIST BADGES (EXASTORE AS ONLY DEFAULT)
             ========================================================= */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-sans text-[12px] font-bold text-slate-900 flex items-center gap-2">
                  Allowed Merchants Allowlist
                  <span className="font-mono text-[10.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {mandate.merchant_allowlist.length} Approved
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-sans">
                  Default Store: <strong>ExaStore</strong>. Transactions to unlisted stores are rejected in &lt;0.05ms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset to ExaStore Only */}
                {(mandate.merchant_allowlist.length !== 1 || mandate.merchant_allowlist[0] !== "ExaStore") && (
                  <button
                    type="button"
                    onClick={handleResetToExaStoreOnly}
                    className="text-[11px] font-sans font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Reset allowlist to only ExaStore"
                  >
                    <Store className="w-3 h-3" />
                    ExaStore Only
                  </button>
                )}

                {!isAddingMerchant && (
                  <button
                    type="button"
                    onClick={() => setIsAddingMerchant(true)}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Merchant
                  </button>
                )}
              </div>
            </div>

            {/* Inline Add Merchant Input */}
            {isAddingMerchant && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMerchantInput}
                    onChange={(e) => setNewMerchantInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMerchant();
                      } else if (e.key === "Escape") {
                        setIsAddingMerchant(false);
                      }
                    }}
                    placeholder="Enter merchant name (default: ExaStore)"
                    className="flex-1 bg-white border border-slate-300 text-slate-900 text-[12px] font-mono px-3 py-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMerchant()}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[11.5px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMerchant(false);
                      setNewMerchantInput("");
                    }}
                    className="text-slate-500 hover:text-slate-800 text-[11.5px] px-2 py-1.5 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Preset Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10.5px] font-mono text-slate-400">Quick Add:</span>
                  {COMMON_MERCHANT_PRESETS.filter(
                    (p) => !mandate.merchant_allowlist.some((m) => m.toLowerCase() === p.toLowerCase())
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddMerchant(preset)}
                      className="text-[10.5px] font-mono font-medium px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Allowlist Pills */}
            <div className="flex flex-wrap gap-2">
              {mandate.merchant_allowlist.map((m) => (
                <span
                  key={m}
                  className={`group inline-flex items-center gap-1.5 font-mono text-[11.5px] pl-2.5 pr-1.5 py-1 rounded-lg font-semibold transition-colors shadow-2xs ${
                    m.toLowerCase() === "exastore"
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                      : "bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800"
                  }`}
                >
                  {m.toLowerCase() === "exastore" && <Store className="w-3 h-3 text-emerald-700" />}
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMerchant(m)}
                    className="w-4 h-4 rounded hover:bg-rose-100 hover:text-rose-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={`Remove ${m} from allowlist`}
                    title={`Remove ${m}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {mandate.merchant_allowlist.length === 0 && (
                <div className="text-[12px] text-amber-700 font-mono bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Allowlist is empty! All transactions will fail Pass 3 hard-gate check.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic RTO Tiers & Mandate History Ledger */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Dynamic RTO Tiers Card (WITH EDITABLE +₹49 DEPOSIT AMOUNT) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span className="font-sans text-[12px] font-bold text-slate-900 uppercase tracking-wider">
                  Dynamic RTO Tiers
                </span>
              </div>
              <span className="pill-neutral font-mono text-[10px] uppercase font-bold">
                ADS MATRIX
              </span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-[11px]">
              {/* Low Risk */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-900 font-bold block">ADS &gt; 0.75 · LOW RISK</span>
                  <span className="text-slate-500 text-[10.5px]">Metro Prime / Door Anchor</span>
                </div>
                <span className="pill-pass font-bold text-[10.5px]">DIRECT COD (₹0)</span>
              </div>

              {/* Medium Risk (EDITABLE AMOUNT AS REQUESTED) */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-900 font-bold block">0.40 – 0.75 · MED RISK</span>
                  <span className="text-slate-500 text-[10.5px]">Informal Landmark / Ward</span>
                </div>

                {isEditingDeposit ? (
                  <div className="flex items-center gap-1 animate-fadeIn">
                    <span className="text-[11px] font-bold text-amber-900">+₹</span>
                    <input
                      type="number"
                      value={depositInput}
                      onChange={(e) => setDepositInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveDeposit();
                        if (e.key === "Escape") setIsEditingDeposit(false);
                      }}
                      className="w-16 bg-white border border-amber-300 text-amber-900 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveDeposit}
                      className="bg-amber-800 hover:bg-amber-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDeposit(false)}
                      className="text-slate-400 hover:text-slate-700 text-[10px] px-1 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDepositInput(String(currentDeposit));
                      setIsEditingDeposit(true);
                    }}
                    className="pill-pending font-bold text-[10.5px] hover:ring-1 hover:ring-amber-400 cursor-pointer transition-all flex items-center gap-1"
                    title="Click to edit medium-risk deposit amount"
                  >
                    <span>+₹{currentDeposit} DEPOSIT</span>
                    <Pencil className="w-2.5 h-2.5 text-amber-700 opacity-60 hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* High Risk */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-900 font-bold block">ADS &lt; 0.40 · HIGH RISK</span>
                  <span className="text-slate-500 text-[10.5px]">High Gibberish / No PIN</span>
                </div>
                <span className="pill-blocked font-bold text-[10.5px]">UPI RESERVE HOLD</span>
              </div>
            </div>
          </div>

          {/* Mandate History Mini-Ledger (Historical Switcher List with DELETE Feature) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-700" />
                <span className="font-sans text-[12px] font-bold text-slate-900 uppercase tracking-wider">
                  Historical Policies in SQLite
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                {allMandates.length} STORED
              </span>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 font-mono text-[11px]">
              {allMandates.map((m) => {
                const isSelected = m.id === mandate.id;
                const isPolicyActive = m.status === "active" || m.status === "partially_debited";

                return (
                  <div
                    key={m.id}
                    className={`py-2.5 px-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                      isSelected ? "bg-slate-100/80 font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-[11.5px] truncate">
                          {m.category}
                        </span>
                        {isPolicyActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                          isPolicyActive 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Cap: ₹{m.per_item_cap} · Hold: ₹{m.daily_hard_cap} · {m.merchant_allowlist.length} merchants
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isSelected ? (
                        <button
                          type="button"
                          onClick={() => onSelectMandate && onSelectMandate(m.id)}
                          className="text-[10.5px] font-sans font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-[10px] font-sans font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                          Viewing
                        </span>
                      )}

                      {!isPolicyActive && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (onSelectMandate) await onSelectMandate(m.id);
                            await onUpdateMandate({ action: "ACTIVATE", mandate_id: m.id });
                            triggerNotice(`Activated ${m.category} policy`);
                          }}
                          className="text-[10.5px] font-sans font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                          title="Activate this mandate for transaction rails"
                        >
                          Activate
                        </button>
                      )}

                      {/* Delete this rule button in list */}
                      {allMandates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePolicy(m.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete this policy"
                          aria-label={`Delete policy ${m.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
