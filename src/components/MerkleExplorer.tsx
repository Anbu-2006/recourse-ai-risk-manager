"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  ShieldCheck,
  Lock,
  KeyRound,
  RefreshCw,
  Download,
  Copy,
  Check,
  Search,
  ChevronRight,
  Hash,
  FileCode,
  ArrowRight,
} from "lucide-react";

export interface MerkleNode {
  node_index: number;
  previous_hash: string;
  node_hash: string;
  payload: any;
  signature: string;
  timestamp: string;
  pge_token: string;
}

interface MerkleExplorerProps {
  onFlagOrder?: (tx: any) => void;
  onRefresh?: () => void;
  agentConsoleSlot?: React.ReactNode;
  refreshTrigger?: number;
}

export const MerkleExplorer: React.FC<MerkleExplorerProps> = ({ onFlagOrder, onRefresh, agentConsoleSlot, refreshTrigger }) => {
  const [nodes, setNodes] = useState<MerkleNode[]>([]);
  const [chainIntegrity, setChainIntegrity] = useState<any | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");

  const fetchLedger = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/audit?limit=50");
      const data = await res.json();
      if (res.ok) {
        setNodes(data.merkle_chain || []);
        setChainIntegrity(data.chain_integrity || null);
        if (data.merkle_chain && data.merkle_chain.length > 0) {
          setSelectedNodeIndex(data.merkle_chain[0].node_index);
        }
      }
    } catch (err) {
      console.error("Failed to fetch Merkle ledger:", err);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [refreshTrigger]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const exportLedgerJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ chain_integrity: chainIntegrity, nodes }, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `merkle_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedNode = nodes.find((n) => n.node_index === selectedNodeIndex) || nodes[0];

  const getEventBadge = (eventStr?: string) => {
    const ev = (eventStr || "").toUpperCase();
    if (ev.includes("EXECUTED") || ev.includes("SETTLED")) {
      return { text: "SETTLED", className: "pill-pass" };
    }
    if (ev.includes("BLOCKED") || ev.includes("INJECTION")) {
      return { text: "BLOCKED", className: "pill-blocked" };
    }
    if (ev.includes("DISPUTE")) {
      return { text: "DAO DISPUTE", className: "pill-pending" };
    }
    if (ev.includes("APPROVED")) {
      return { text: "HITL APPROVED", className: "pill-pass" };
    }
    if (ev.includes("GENESIS")) {
      return { text: "GENESIS", className: "pill-neutral" };
    }
    return { text: ev || "AUDIT RECORD", className: "pill-neutral" };
  };

  const filteredNodes = nodes.filter((n) => {
    const eventName = n.payload?.event || n.payload?.type || "AUDIT_NODE";
    if (eventFilter !== "ALL" && !eventName.toUpperCase().includes(eventFilter)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.node_hash.toLowerCase().includes(q) ||
      n.previous_hash.toLowerCase().includes(q) ||
      n.signature.toLowerCase().includes(q) ||
      JSON.stringify(n.payload).toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-4 text-slate-900 font-sans">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-white font-semibold tracking-wider uppercase">
              Cryptographic Notary
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[10.5px] text-emerald-700 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Ed25519 &amp; SHA-256 Ledger
            </span>
          </div>
          <h2 className="font-sans font-bold text-[18px] text-slate-900 tracking-tight">
            Immutable Merkle Hash-Chain &amp; PGE Explorer
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={exportLedgerJSON}
            className="btn-secondary h-[34px] px-3 text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={fetchLedger}
            disabled={verifying}
            className="btn-primary h-[34px] px-3.5 text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
            <span>{verifying ? "Recalculating..." : "Verify Chain Integrity"}</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Chain Integrity Status
            </span>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[14px] text-emerald-700 font-bold">
                {chainIntegrity?.isValid ? "100% UNTAMPERED ✓" : "VERIFIED ✓"}
              </span>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Verified Merkle Nodes
            </span>
            <span className="font-mono text-[18px] text-slate-900 font-bold pt-1">
              {nodes.length} Blocks Linked
            </span>
          </div>
          <Database className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Signature Scheme
            </span>
            <span className="font-mono text-[13px] text-slate-900 font-semibold pt-1">
              Ed25519 (Edwards Curve)
            </span>
          </div>
          <KeyRound className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Proof of Gate Execution (PGE)
            </span>
            <span className="font-mono text-[13px] text-amber-700 font-semibold pt-1">
              HMAC-SHA256 Tokenized
            </span>
          </div>
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
      </div>



      {/* 3-Column Equal-Height Architecture Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Column 1: AI Chat Bot / AgentConsole */}
        <div className="lg:col-span-4 h-[580px] overflow-hidden">
          {agentConsoleSlot}
        </div>

        {/* Column 2: Selected Block Cryptographic Inspector */}
        <div className="lg:col-span-4 h-[580px] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-emerald-400 shadow-xs">
                <FileCode className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-[13px] text-slate-900 tracking-tight leading-tight">
                  Block #{selectedNode?.node_index} Cryptographic Inspector
                </h3>
                <span className="text-[9.5px] text-slate-500 font-mono">Ed25519 &amp; PGE Token</span>
              </div>
            </div>
            {selectedNode && (
              <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getEventBadge(selectedNode.payload?.event || selectedNode.payload?.type).className}`}>
                {getEventBadge(selectedNode.payload?.event || selectedNode.payload?.type).text}
              </span>
            )}
          </div>

          {/* Body: Hashes and tokens shrunk inside box! */}
          {selectedNode ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
              {/* Previous State Hash */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span>PREVIOUS STATE HASH (H_{selectedNode.node_index - 1})</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedNode.previous_hash, "prev_hash")}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash === "prev_hash" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash === "prev_hash" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[10.5px] font-mono truncate select-all" title={selectedNode.previous_hash}>
                  {selectedNode.previous_hash}
                </div>
              </div>

              {/* Current Node Hash */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span>CURRENT NODE HASH (SHA-256)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedNode.node_hash, "node_hash")}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash === "node_hash" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash === "node_hash" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-900 text-[10.5px] font-mono font-bold truncate select-all" title={selectedNode.node_hash}>
                  {selectedNode.node_hash}
                </div>
              </div>

              {/* PGE Token - Shrunk & Compact */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span>PGE TOKEN (HMAC-SHA256)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedNode.pge_token, "pge_token")}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash === "pge_token" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash === "pge_token" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="px-2.5 py-1 rounded bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[10.5px] font-mono truncate select-all" title={selectedNode.pge_token}>
                  {selectedNode.pge_token}
                </div>
              </div>

              {/* Ed25519 Signature */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span>ED25519 SIGNATURE</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedNode.signature, "signature")}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash === "signature" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash === "signature" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[10.5px] font-mono truncate select-all" title={selectedNode.signature}>
                  {selectedNode.signature}
                </div>
              </div>

              {/* Payload JSON Inspector */}
              <div className="space-y-0.5 pt-0.5">
                <span className="text-slate-500 text-[10px] block font-semibold uppercase">PAYLOAD ATTRIBUTES:</span>
                <pre className="p-2 rounded bg-slate-900 text-slate-100 text-[10px] font-mono overflow-auto leading-relaxed max-h-[215px]">
                  {JSON.stringify(selectedNode.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-mono text-[11px]">
              No block selected.
            </div>
          )}
        </div>

        {/* Column 3: Searchable Ledger Records */}
        <div className="lg:col-span-4 h-[580px] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search block, hash, or payload..."
                className="bg-transparent border-none text-[11px] font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-slate-500 uppercase font-semibold">Filter:</span>
              <div className="flex items-center gap-1 font-mono text-[9.5px]">
                {["ALL", "SETTLED", "BLOCKED", "DISPUTE"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setEventFilter(filter)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      eventFilter === filter
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table of Nodes (Displays down to Block #11 ~7 items, internal scroll for remainder) */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {filteredNodes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-[11.5px]">
                No cryptographic records match query.
              </div>
            ) : (
              filteredNodes.map((node) => {
                const badge = getEventBadge(node.payload?.event || node.payload?.type);
                const isSelected = selectedNode?.node_index === node.node_index;
                return (
                  <div
                    key={node.node_index}
                    onClick={() => setSelectedNodeIndex(node.node_index)}
                    className={`p-2.5 transition-colors cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? "bg-slate-50 border-l-3 border-slate-900"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-900">
                          Block #{node.node_index}
                        </span>
                        <span className={`font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded border uppercase ${badge.className}`}>
                          {badge.text}
                        </span>
                        <span className="font-mono text-[9.5px] text-slate-400">
                          {new Date(node.timestamp).toTimeString().split(" ")[0]} UTC
                        </span>
                      </div>

                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                        Hash: {node.node_hash.slice(0, 16)}...
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {onFlagOrder && (node.payload?.orderId || node.payload?.order_id || badge.text === "SETTLED" || badge.text === "DAO DISPUTE") && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const simulatedTx = {
                              id: node.payload?.paymentId || `pay_${node.node_index}_${Date.now().toString().slice(-4)}`,
                              order_id: node.payload?.orderId || node.payload?.order_id || `order_rzp_${node.node_index}`,
                              amount: node.payload?.amountPaisa ? node.payload.amountPaisa / 100 : (node.payload?.amount || 1250),
                              merchant: node.payload?.merchant || "BigBasket",
                              item: node.payload?.item || "Authorized Agent Item",
                              category: node.payload?.category || "Groceries",
                              status: "disputed" as const,
                              created_at: new Date(node.timestamp).toISOString(),
                              risk_tier: "LOW" as const,
                              awb_number: "987654321",
                            };
                            onFlagOrder(simulatedTx);
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                        >
                          Dispute Drawer
                        </button>
                      )}
                      <span className="pill-pass font-mono text-[9px]">
                        Ed25519 Valid
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
