"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";

export type GuideTab = "groq" | "razorpay" | "hmac";

interface KeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: GuideTab;
}

export const KeyGuideModal: React.FC<KeyGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = "groq",
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>(initialTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                API Credentials & Setup Guide
              </h3>
              <p className="text-xs text-slate-500">
                Step-by-step instructions to get free sandbox & production keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("groq")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "groq"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Groq API Key</span>
          </button>
          <button
            onClick={() => setActiveTab("razorpay")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "razorpay"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Razorpay Test Keys</span>
          </button>
          <button
            onClick={() => setActiveTab("hmac")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "hmac"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Recourse HMAC Secret</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* GROQ GUIDE */}
          {activeTab === "groq" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>Free Tier &middot; Ultra-Low Latency Inference</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Groq powers sub-2ms parameter extraction and automated dispute rebuttal synthesis with high-throughput LPUs.
                  </p>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs whitespace-nowrap ml-3"
                >
                  <span>Open Groq Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Step-by-Step Instructions:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Sign in to Groq Console</p>
                      <p className="text-slate-600">
                        Visit <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-mono underline">console.groq.com</a> and sign in with your Google, GitHub, or email account. (No credit card required).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Navigate to API Keys</p>
                      <p className="text-slate-600">
                        In the left sidebar menu, click on <strong>API Keys</strong> or go directly to <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-emerald-700 font-mono underline">console.groq.com/keys</a>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Create a New Key</p>
                      <p className="text-slate-600">
                        Click <strong>"+ Create API Key"</strong>. Enter a friendly name like <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-slate-800">Recourse-Risk-Manager</code> and click <strong>Submit</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Copy &amp; Paste</p>
                      <p className="text-slate-600">
                        Copy the generated key (it begins with <code className="font-mono bg-slate-200/80 px-1 py-0.5 rounded font-bold text-slate-900">gsk_...</code>) and paste it into the <strong>Groq API Key</strong> input in Recourse.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RAZORPAY GUIDE */}
          {activeTab === "razorpay" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="space-y-1">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Free Test Mode &middot; Zero Real Money Needed</span>
                  </div>
                  <p className="text-xs text-blue-800">
                    Razorpay test keys simulate real UPI Reserve holds, order creations, and dispute representment without charging any real bank account.
                  </p>
                </div>
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs whitespace-nowrap ml-3"
                >
                  <span>Open Razorpay Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Step-by-Step Instructions:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Log in to Razorpay</p>
                      <p className="text-slate-600">
                        Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-blue-700 font-mono underline">dashboard.razorpay.com</a>. If you don't have an account, sign up for free (business verification is NOT needed for test mode).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-300">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-amber-950 flex items-center gap-1">
                        <span>CRITICAL: Switch to "Test Mode"</span>
                      </p>
                      <p className="text-amber-900 mt-0.5">
                        In the top navigation header or bottom-left profile, toggle the switch from <strong>"Live Mode"</strong> to <strong>"Test Mode"</strong>. The dashboard will show a distinct orange/yellow banner.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Go to API Keys</p>
                      <p className="text-slate-600">
                        Click on <strong>Account &amp; Settings</strong> in the left sidebar. Under the <strong>"Website and app settings"</strong> section, click <strong>"API Keys"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Generate Test Key Pair</p>
                      <p className="text-slate-600">
                        Click <strong>"Generate Test Key"</strong> (or "Regenerate Test Key"). A modal will display:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[11px]">
                        <li><strong>Key ID</strong>: starts with <span className="bg-slate-200/80 px-1 py-0.5 rounded font-bold">rzp_test_...</span></li>
                        <li><strong>Key Secret</strong>: a secure alphanumeric string</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      5
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Paste Both into Recourse</p>
                      <p className="text-slate-600">
                        Copy both values and paste them into the <strong>Razorpay Key ID</strong> and <strong>Razorpay Key Secret</strong> fields in Recourse.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HMAC SECRET GUIDE */}
          {activeTab === "hmac" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="space-y-1">
                  <div className="font-semibold text-purple-900 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span>Auto-Generated &middot; No External Signup Required</span>
                  </div>
                  <p className="text-xs text-purple-800">
                    This secret is Recourse's internal cryptographic key used to seal Proof of Gate Execution (PGE) tokens with HMAC-SHA256.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  How It Works:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-semibold text-slate-900">
                      Why does Recourse need an HMAC secret?
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Whenever an autonomous agent request passes all 4 risk gates, Recourse issues a cryptographic <strong>Proof of Gate Execution (<code className="font-mono text-purple-800">pge_token</code>)</strong> token. This token is signed with HMAC-SHA256 using this 32+ character enterprise key and attached to Razorpay order notes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-semibold text-slate-900">
                      Do I need to sign up anywhere for this?
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>No!</strong> Recourse automatically generates a cryptographically random 32-character key for you directly inside the setup modal. You can simply click <strong>"Regenerate"</strong> if you want a new key, or keep the default.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50/80">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Credentials stay in your browser &middot; 100% private</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            Got it, Return to Setup
          </button>
        </div>
      </div>
    </div>
  );
};
