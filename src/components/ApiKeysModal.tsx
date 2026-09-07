"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cloud,
  ArrowRight,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getStoredApiKeys,
  saveStoredApiKeys,
  resetToDemoKeys,
  generateSecureHmacSecret,
  formatAsEnvString,
  RecourseApiKeys,
} from "@/lib/apiKeys";
import { KeyGuideModal, GuideTab } from "./KeyGuideModal";

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [groqKey, setGroqKey] = useState("");
  const [rzpKeyId, setRzpKeyId] = useState("");
  const [rzpKeySecret, setRzpKeySecret] = useState("");
  const [hmacSecret, setHmacSecret] = useState("");

  const [showGroq, setShowGroq] = useState(false);
  const [showRzpId, setShowRzpId] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showHmac, setShowHmac] = useState(false);

  const [isLocalEnv, setIsLocalEnv] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Guide Modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<GuideTab>("groq");

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKeys();
      setGroqKey(stored.groqApiKey || "");
      setRzpKeyId(stored.razorpayKeyId || "");
      setRzpKeySecret(stored.razorpayKeySecret || "");
      setHmacSecret(stored.recourseHmacSecret || generateSecureHmacSecret());
      setSaveStatus(null);

      // Check environment mode (local vs cloud)
      fetch("/api/config/env")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsLocalEnv(data.isLocal);
          }
        })
        .catch(() => {
          setIsLocalEnv(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegenerateHmac = () => {
    setHmacSecret(generateSecureHmacSecret());
  };

  const handleOpenGuide = (tab: GuideTab) => {
    setGuideTab(tab);
    setIsGuideOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const keysToSave: Partial<RecourseApiKeys> = {
      groqApiKey: groqKey.trim(),
      razorpayKeyId: rzpKeyId.trim(),
      razorpayKeySecret: rzpKeySecret.trim(),
      recourseHmacSecret: hmacSecret.trim() || generateSecureHmacSecret(),
    };

    try {
      // 1. Always save to client-side localStorage (guarantees per-user PC isolation)
      saveStoredApiKeys(keysToSave);

      // 2. Call backend config endpoint (if local, it writes to .env.local on PC)
      const res = await fetch("/api/config/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keysToSave),
      });

      const data = await res.json();

      if (data.savedLocally) {
        setSaveStatus({
          type: "success",
          message: "Saved to your browser & .env.local updated successfully on your PC!",
        });
      } else {
        setSaveStatus({
          type: "success",
          message: "Credentials saved exclusively to your browser! 100% isolated session active.",
        });
      }

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        message: err.message || "Failed to save configuration.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadEnv = () => {
    const keys: RecourseApiKeys = {
      groqApiKey: groqKey.trim(),
      razorpayKeyId: rzpKeyId.trim(),
      razorpayKeySecret: rzpKeySecret.trim(),
      recourseHmacSecret: hmacSecret.trim() || generateSecureHmacSecret(),
      isCustom: true,
    };
    const content = formatAsEnvString(keys);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env.local";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUseDemo = () => {
    resetToDemoKeys();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Top Banner & Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    API Credentials &amp; Environment Setup
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure your AI inference and settlement credentials to activate live enforcement
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Environment Mode Callout */}
            <div className="mt-3.5 flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs">
              {isLocalEnv ? (
                <>
                  <HardDrive className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900">Localhost Mode:</strong> Submitting will automatically generate or update <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env.local</code> on your computer.
                  </span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900">Cloud Deployment:</strong> Keys are stored safely in <strong>your browser alone</strong> and forwarded via secure headers. Zero leakage to other visitors.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            {saveStatus && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  saveStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {saveStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{saveStatus.message}</span>
              </div>
            )}

            {/* 1. Groq API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Groq API Key</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">(LPU Inference)</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenGuide("groq")}
                  className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to get this key?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showGroq ? "text" : "password"}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Powers ultra-fast AST parameter extraction and autonomous legal rebuttal synthesis.
              </p>
            </div>

            {/* 2. Razorpay Key ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Razorpay Key ID</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">(Test Mode)</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenGuide("razorpay")}
                  className="text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to get this key?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showRzpId ? "text" : "password"}
                  value={rzpKeyId}
                  onChange={(e) => setRzpKeyId(e.target.value)}
                  placeholder="rzp_test_..."
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowRzpId(!showRzpId)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showRzpId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Your Razorpay public test key for simulating order generation &amp; dispute contestation.
              </p>
            </div>

            {/* 3. Razorpay Key Secret */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Razorpay Key Secret</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showRzpSecret ? "text" : "password"}
                  value={rzpKeySecret}
                  onChange={(e) => setRzpKeySecret(e.target.value)}
                  placeholder="Secret generated from Razorpay dashboard..."
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowRzpSecret(!showRzpSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showRzpSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Recourse HMAC Secret (Auto-generated) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Recourse HMAC Secret</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono font-medium">
                    Auto-Generated
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateHmac}
                  className="text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Key</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showHmac ? "text" : "password"}
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden transition-all text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowHmac(!showHmac)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showHmac ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Cryptographically seals Proof of Gate Execution (<code className="font-mono text-purple-800">pge_token</code>) tokens for payment capture verification.
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200 bg-white"
              >
                Use Built-in Sandbox Demo
              </button>
              <button
                type="button"
                onClick={handleDownloadEnv}
                title="Download configured .env.local file"
                className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200 bg-white flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download .env</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Apply Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Key Guide Modal */}
      <KeyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={guideTab}
      />
    </>
  );
};
