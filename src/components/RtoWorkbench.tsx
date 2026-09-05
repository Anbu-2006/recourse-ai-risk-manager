"use client";

import React, { useState } from "react";
import { MapPin, ArrowRightLeft, ArrowRight, RefreshCw } from "lucide-react";

export const RtoWorkbench: React.FC = () => {
  const [addressInput, setAddressInput] = useState(
    "Near Shani Mandir, Behind Old Water Tank, Ward No 7, Chandausi, Uttar Pradesh 244412"
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any>({
    adsScore: 0.70,
    syntaxScore: 0.50,
    landmarkScore: 0.85,
    geoCoherenceScore: 0.60,
    gibberishProb: 0.02,
    riskTier: "MEDIUM",
    paymentStrategy: "REQUIRE_SHIPPING_DEPOSIT",
    depositPaisa: 4900,
    depositInr: "49.00",
    reason: "Informal unstructured address with landmark/ward anchor (hedged with ₹49 deposit)",
  });

  const samples = [
    {
      label: "Tier-1 Metro Apartment (Prime)",
      address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103",
    },
    {
      label: "Rural Informal Landmark (Medium)",
      address: "Behind Hanuman Temple, Ward 4, Sasaram, Rohtas, Bihar 821115",
    },
    {
      label: "Semi-Urban Ward Anchor (Medium)",
      address: "Near Shani Mandir, Behind Old Water Tank, Ward No 7, Chandausi, UP 244412",
    },
    {
      label: "Bogus / Gibberish Scam (High)",
      address: "asdfghjk qwerty 123456 fake street",
    },
  ];

  const handleEvaluate = async (addrToScore?: string) => {
    const text = addrToScore || addressInput;
    if (!text.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/risk/evaluate-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_address: text,
          amount_paisa: 32000,
          merchant: "BigBasket",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          adsScore: data.ads_score,
          syntaxScore: data.breakdown?.syntax,
          landmarkScore: data.breakdown?.landmark,
          geoCoherenceScore: data.breakdown?.geo_coherence,
          gibberishProb: data.breakdown?.gibberish_prob,
          riskTier: data.risk_tier,
          paymentStrategy: data.payment_strategy,
          depositPaisa: data.deposit_paisa,
          depositInr: data.deposit_inr,
          reason: data.breakdown?.reason,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-bold tracking-wider uppercase shadow-2xs">
              RTO Margin Hedging Engine
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-[12px] text-emerald-700 font-semibold">
              Replaces Binary COD Blocking
            </span>
          </div>
          <h1 className="font-sans font-bold text-[26px] sm:text-[30px] text-slate-900 tracking-tight leading-snug">
            Dynamic Address Deliverability Scorer (ADS)
          </h1>
          <p className="font-sans text-[13px] text-slate-600 leading-normal max-w-4xl">
            NLP parsing of unstructured Indian geography ("Behind Hanuman Temple, Ward 4") to inject dynamic ₹49–₹99 UPI Reservation Deposits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono shrink-0">
          <span className="text-slate-500 font-semibold">Baseline RTO Reduction:</span>
          <span className="text-emerald-700 font-bold text-[15px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">72.4%</span>
        </div>
      </div>

      {/* Main Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (6 Cols): Interactive Address Tester */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="font-sans font-bold text-[15px] text-slate-900">
                Raw Address Ingestion
              </h2>
            </div>
            <span className="font-mono text-[10.5px] font-semibold text-slate-500">
              MODEL: GROQ LLAMA-3.3-70B + REGEX
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Sample Indian Vectors:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAddressInput(s.address);
                    handleEvaluate(s.address);
                  }}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col gap-1 cursor-pointer shadow-2xs"
                >
                  <span className="font-sans font-bold text-[12.5px] text-slate-900">{s.label}</span>
                  <span className="font-mono text-[11px] text-slate-500 truncate">{s.address}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Address Text Area */}
          <div className="space-y-2 pt-2">
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unstructured Address Input
            </label>
            <textarea
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-[13px] font-mono focus:outline-none focus:border-blue-500 leading-relaxed shadow-inner"
              placeholder="Enter raw unstructured Indian address text..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleEvaluate()}
              disabled={isEvaluating}
              className="h-[40px] px-5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Deliverability Score...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Deliverability (ADS)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right (6 Cols): Scoring Breakdown & Payment Conversion Strategy */}
        <div className="lg:col-span-6 space-y-4">
          {/* ADS Score Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Deliverability Evaluation
              </span>
              <span
                className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                  result.riskTier === "LOW"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : result.riskTier === "MEDIUM"
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}
              >
                {result.riskTier} RTO RISK
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[40px] font-black text-slate-900 tracking-tight leading-none">
                {(result.adsScore * 100).toFixed(1)}
              </span>
              <span className="font-mono text-[14px] text-slate-500 font-semibold">
                / 100 ADS Score
              </span>
            </div>

            {/* 4 Dimension Progress Bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11.5px] font-mono text-slate-600 mb-1">
                  <span>Syntax Score (30% weight)</span>
                  <span className="text-slate-900 font-bold">{((result.syntaxScore ?? 0.8) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(result.syntaxScore ?? 0.8) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11.5px] font-mono text-slate-600 mb-1">
                  <span>Landmark Anchor (35% weight)</span>
                  <span className="text-slate-900 font-bold">{((result.landmarkScore ?? 0.7) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(result.landmarkScore ?? 0.7) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11.5px] font-mono text-slate-600 mb-1">
                  <span>Geo-Coherence (25% weight)</span>
                  <span className="text-slate-900 font-bold">{((result.geoCoherenceScore ?? 0.8) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(result.geoCoherenceScore ?? 0.8) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11.5px] font-mono text-slate-600 mb-1">
                  <span>Gibberish Probability (10% inverse weight)</span>
                  <span className="text-slate-900 font-bold">{((result.gibberishProb ?? 0.02) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(result.gibberishProb ?? 0.02) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Payment Strategy Outcome Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Payment Conversion Policy
                </span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-[13.5px] font-bold text-slate-900">
                  {result.paymentStrategy === "DIRECT_COD"
                    ? "Direct Free COD Approved"
                    : result.paymentStrategy === "REQUIRE_SHIPPING_DEPOSIT"
                    ? "Dynamic ₹49 UPI Reservation Deposit Injected"
                    : "Mandatory UPI Reserve Pay Hold Enacted"}
                </span>
                {result.depositPaisa > 0 && (
                  <span className="font-mono text-[12px] text-amber-900 font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 shadow-2xs">
                    +₹{result.depositInr}
                  </span>
                )}
              </div>

              <p className="font-sans text-[12px] text-slate-600 leading-relaxed">
                {result.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
