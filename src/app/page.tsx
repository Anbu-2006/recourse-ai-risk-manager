"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header, NavTabType } from "@/components/Header";
import { GroqPolicyBuilder, StagedDraft } from "@/components/GroqPolicyBuilder";
import { RuleApprovalModal } from "@/components/RuleApprovalModal";
import { PipelineVisualizer } from "@/components/PipelineVisualizer";
import { MandatePanel } from "@/components/MandatePanel";
import { AgentConsole } from "@/components/AgentConsole";
import { AuditTrail } from "@/components/AuditTrail";
import { DisputeSlideOver } from "@/components/DisputeSlideOver";
import { DisputeWorkbench } from "@/components/DisputeWorkbench";
import { MerkleExplorer } from "@/components/MerkleExplorer";
import { OverviewArchitecture } from "@/components/OverviewArchitecture";
import { Mandate, Transaction, AuditLogEntry } from "@/lib/types";
import {
  ShieldCheck,
  Scale,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Layers,
  FileCheck2,
  Zap,
  History,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTabType>("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "overview" || tab === "rules" || tab === "inspector" || tab === "disputes") {
        setActiveTab(tab as NavTabType);
      }
    }
  }, []);

  // Pipeline telemetry state for the Visualizer
  const [pipelineState, setPipelineState] = useState<{
    pass1Passed: boolean;
    pass2Tier: "LOW" | "MEDIUM" | "HIGH";
    adsScore: number;
    pass3Passed: boolean;
    pass4OrderId?: string;
    latencyMs: number;
  }>({
    pass1Passed: true,
    pass2Tier: "LOW",
    adsScore: 0.92,
    pass3Passed: true,
    pass4OrderId: undefined,
    latencyMs: 0.02,
  });

  // Active Mandate state
  const [mandate, setMandate] = useState<Mandate>({
    id: "mandate_groceries_001",
    category: "Groceries",
    per_item_cap: 3000,
    daily_hard_cap: 25000,
    merchant_allowlist: ["ExaStore"],
    schedule_days: ["Everyday"],
    spent_to_date: 0,
    time_window_start: "06:00",
    time_window_end: "23:00",
    status: "active",
    created_at: new Date().toISOString(),
  });

  // Mandates State (Active & Historical)
  const [allMandates, setAllMandates] = useState<Mandate[]>([]);

  // Staged HITL Mandate & Modal Controls
  const [pendingMandate, setPendingMandate] = useState<any | null>(null);
  const [stagedDraft, setStagedDraft] = useState<StagedDraft | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Dispute Slide-Over State
  const [disputeTx, setDisputeTx] = useState<Transaction | null>(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  // Fetch Mandate & Pending Staged Policy
  const fetchMandate = useCallback(async (selectedId?: string) => {
    try {
      const url = selectedId ? `/api/mandate?mandate_id=${encodeURIComponent(selectedId)}` : "/api/mandate";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.mandate) setMandate(data.mandate);
        if (data.mandates) setAllMandates(data.mandates);
        if (data.pending_mandate) {
          setPendingMandate(data.pending_mandate);
        } else {
          setPendingMandate(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch mandate:", err);
    }
  }, []);

  // Fetch Audit Log & Transactions
  const fetchAuditLog = useCallback(async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        if (data.entries) setAuditEntries(data.entries);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch audit log:", err);
    }
  }, []);

  useEffect(() => {
    fetchMandate();
    fetchAuditLog();
  }, [fetchMandate, fetchAuditLog]);

  const handleSelectMandate = async (mandateId: string) => {
    await fetchMandate(mandateId);
  };

  const handleUpdateMandate = async (updates: Partial<Mandate> & { action?: string; mandate_id?: string; reload_amount?: number; reset_balance?: boolean }) => {
    try {
      const res = await fetch("/api/mandate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.mandate) setMandate(data.mandate);
        if (data.mandates) setAllMandates(data.mandates);
        await fetchAuditLog();
      }
    } catch (err) {
      console.error("Failed to update mandate:", err);
    }
  };

  const handleDraftCompiled = (draft: StagedDraft) => {
    setStagedDraft(draft);
    setIsApprovalModalOpen(true);
  };

  const handleOpenPendingModal = () => {
    if (pendingMandate) {
      setStagedDraft({
        mandate_id: pendingMandate.id,
        category: pendingMandate.category,
        per_item_cap_inr: pendingMandate.per_item_cap,
        daily_hold_inr: pendingMandate.daily_hard_cap || 25000,
        allowed_merchants: pendingMandate.merchant_allowlist || ["ExaStore"],
        schedule_days: pendingMandate.schedule_days || ["Everyday"],
        status: "PENDING_APPROVAL",
      });
      setIsApprovalModalOpen(true);
    }
  };

  const handleFlagOrder = (tx: Transaction) => {
    setDisputeTx(tx);
    setIsDisputeOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* 1. Global Institutional Header with exactly 4 Navigation Tabs */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Workspace Area */}
      <main id="top" className="w-full flex-1 pb-16">
        {/* =========================================================================
            PAGE 1: PROJECT OVERVIEW & ARCHITECTURE (THE OPENING / ENTRY PAGE)
           ========================================================================= */}
        {activeTab === "overview" && (
          <OverviewArchitecture setActiveTab={setActiveTab} />
        )}

        {/* =========================================================================
            PAGE 2: DYNAMIC RULES & MANDATES ENGINE
            Top: Autonomous Natural Language Policy Compiler (Groq 70B)
            Bottom: Active Institutional Mandate & Spending Rails
           ========================================================================= */}
        {activeTab === "rules" && (
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6 space-y-8">
            {/* Top Institutional KPI Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Active Spending Rail</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[17px] font-bold text-slate-900 truncate">
                  {mandate.category} Rail
                </div>
                <div className="text-[11.5px] font-mono text-slate-500 mt-0.5">
                  ₹{mandate.per_item_cap.toLocaleString("en-IN")} Per-Item Cap
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Hard Gate SLA</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[17px] font-bold text-slate-900">
                  &lt;0.05ms Zero-LLM
                </div>
                <div className="text-[11.5px] font-mono text-slate-500 mt-0.5">
                  Fail-Closed SQLite WAL Hard Gate
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Stored Policies</span>
                  <History className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[17px] font-bold text-slate-900">
                  {allMandates.length || 1} Mandates
                </div>
                <div className="text-[11.5px] font-mono text-slate-500 mt-0.5">
                  Instant Dropdown Policy Switcher
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Representment</span>
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-[17px] font-bold text-slate-900">
                  Ed25519 Notary
                </div>
                <div className="text-[11.5px] font-mono text-slate-500 mt-0.5">
                  Merkle-Chained Intent Receipts
                </div>
              </div>
            </div>

            {/* Section A: Autonomous Natural Language Policy Compiler (Groq 70B) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Natural Language Policy Drafter &middot; Powered by Groq 70B</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Natural Language Spending Policy Compiler
              </h2>
              <p className="text-sm text-slate-500 max-w-[820px]">
                Draft or alter spending boundaries using conversational instructions. Groq autonomously parses the intent into a formal institutional policy draft requiring Human-in-the-Loop (HITL) approval.
              </p>
              <div className="pt-2">
                <GroqPolicyBuilder onDraftCompiled={handleDraftCompiled} />
              </div>
            </div>

            {/* Section B: Active Institutional Mandate & Reserve Pay Controls */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                <Sliders className="w-3.5 h-3.5" />
                <span>Active Governance Policy &middot; Spending Rails</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Institutional Mandate &amp; Reserve Pay Budget
              </h2>
              <p className="text-sm text-slate-500 max-w-[820px]">
                Active spending rules enforced in real time against every agent transaction. Switch between historical policies, manage liquidity, or update merchant allowlists below.
              </p>

              <div className="pt-2">
                <MandatePanel
                  mandate={mandate}
                  allMandates={allMandates}
                  pendingMandate={pendingMandate}
                  onUpdateMandate={handleUpdateMandate}
                  onSelectMandate={handleSelectMandate}
                  onTriggerReviewModal={handleOpenPendingModal}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 3: RISK & AUDIT INSPECTOR
            Top: Live Pipeline Visualizer
            Bottom: Two-Column Master-Detail Grid (Left: AgentConsole, Right: MerkleExplorer)
           ========================================================================= */}
        {activeTab === "inspector" && (
          <div className="max-w-[1560px] mx-auto px-4 md:px-8 mt-6 space-y-5">
            {/* Top Inspector Header & Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Real-Time Pre-Auth Interception &middot; Cryptographic Notary</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Transaction Telemetry &amp; Merkle Audit Hub
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Interactive procurement sandbox, deterministic multi-pass defense, and immutable SHA-256 Merkle chain verification.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-Trust Gate</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  SLA: &lt;0.02ms
                </span>
              </div>
            </div>

            {/* Pre-Payment Defense Pipeline Telemetry */}
            <PipelineVisualizer
              pass1Passed={pipelineState.pass1Passed}
              pass2Tier={pipelineState.pass2Tier}
              adsScore={pipelineState.adsScore}
              pass3Passed={pipelineState.pass3Passed}
              pass4OrderId={pipelineState.pass4OrderId}
              latencyMs={pipelineState.latencyMs}
            />

            {/* Unified 3-Column Telemetry & Cryptographic Audit Hub */}
            <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <MerkleExplorer
                onFlagOrder={handleFlagOrder}
                onRefresh={fetchAuditLog}
                agentConsoleSlot={
                  <AgentConsole
                    onTransactionExecuted={() => {
                      fetchAuditLog();
                      fetchMandate();
                    }}
                    onPipelineUpdate={(state) => {
                      setPipelineState((prev) => ({
                        ...prev,
                        ...state,
                      }));
                    }}
                    onOpenDispute={() => {
                      const sampleTx: Transaction = {
                        id: "pay_test_carrier_987654",
                        order_id: "order_rzp_demo",
                        amount: 1250,
                        merchant: "BigBasket",
                        item: "Gourmet Organic Basket",
                        category: "Groceries",
                        status: "disputed",
                        created_at: new Date().toISOString(),
                        risk_tier: "LOW",
                        awb_number: "987654321",
                      };
                      handleFlagOrder(sampleTx);
                    }}
                  />
                }
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 4: DISPUTE DEFENSE & RTO WORKBENCH
           ========================================================================= */}
        {activeTab === "disputes" && (
          <div className="max-w-[1560px] mx-auto px-4 md:px-8 mt-8 space-y-4">
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                <Scale className="w-3.5 h-3.5" />
                <span>DAO Adjudication &middot; Carrier OTP Verification</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Dispute Defense &amp; RTO Workbench
              </h2>
              <p className="text-sm text-slate-500">
                Automated 72-hour chargeback defense with 3PL carrier OTP verification, cryptographic Proof-of-Delivery dossiers, and Razorpay refund mediation.
              </p>
            </div>
            <DisputeWorkbench />
          </div>
        )}
      </main>

      {/* Global Minimalist Institutional Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 md:px-8 mt-auto">
        <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-900">Recourse Enterprise</span>
            <span>&middot;</span>
            <span>Razorpay Buildathon Track 02 (AI Risk Manager)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11.5px]">
            <span>Sub-2ms Deterministic Gate</span>
            <span>&middot;</span>
            <span>Groq ADS Scoring</span>
            <span>&middot;</span>
            <span>Merkle Notary Ledger</span>
            <span>&middot;</span>
            <span className="text-emerald-700 font-semibold">Razorpay Test Rails Active</span>
          </div>
        </div>
      </footer>

      {/* Interactive Pop-Up: Groq Rule Approval & HITL Verification Modal */}
      <RuleApprovalModal
        draft={stagedDraft}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setStagedDraft(null);
        }}
        onApproved={() => {
          fetchMandate();
          fetchAuditLog();
        }}
      />

      {/* Slide-Over Quick Inspection Panel */}
      <DisputeSlideOver
        isOpen={isDisputeOpen}
        disputeTx={disputeTx}
        onClose={() => {
          setIsDisputeOpen(false);
          setDisputeTx(null);
        }}
        onDisputeContested={() => {
          fetchAuditLog();
          fetchMandate();
        }}
      />
    </div>
  );
}
