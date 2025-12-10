"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  Sliders,
  Activity,
  Scale,
  Key,
} from "lucide-react";
import { getStoredApiKeys } from "@/lib/apiKeys";

export type NavTabType = "overview" | "rules" | "inspector" | "disputes";

interface HeaderProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenApiKeysModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeysModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>("14:32:08 UTC");
  const [isCustomConfig, setIsCustomConfig] = useState<boolean>(false);

  useEffect(() => {
    const checkKeys = () => {
      const keys = getStoredApiKeys();
      setIsCustomConfig(Boolean(keys.isCustom));
    };
    checkKeys();

    window.addEventListener("recourse-keys-updated", checkKeys);
    return () => window.removeEventListener("recourse-keys-updated", checkKeys);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(" ")[0] + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: Array<{ id: NavTabType; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Overview & Architecture", icon: <Compass className="w-3.5 h-3.5" /> },
    { id: "rules", label: "Rules & Mandates", icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: "inspector", label: "Risk & Audit Inspector", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "disputes", label: "Dispute Defense", icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-2.5 shadow-2xs">
      <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Clean Brand Identity with Logo and simple name "Recourse" */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className="inline-flex items-center gap-2.5 font-sans font-bold text-[20px] tracking-tight text-slate-900 hover:opacity-90 transition-opacity text-left cursor-pointer border-none bg-transparent p-0"
          >
            <img
              src="/recourse_logo.png"
              alt="Recourse Logo"
              className="w-8 h-8 rounded-lg object-contain border border-slate-200 shadow-xs"
            />
            <span className="font-bold tracking-tight text-slate-900 font-sans">
              Recourse
            </span>
          </button>
        </div>

        {/* Center: Exactly 4 Top Navigation Tabs (Zero Scrollbars, Perfect Fit) */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200 flex-shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Live Environment Status, API Setup Button & UTC Clock */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenApiKeysModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium transition-all cursor-pointer shadow-2xs ${
              isCustomConfig
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title="Configure Groq, Razorpay & HMAC API Keys"
          >
            <Key className="w-3 h-3 text-slate-600" />
            <span className={`w-1.5 h-1.5 rounded-full ${isCustomConfig ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{isCustomConfig ? "Custom Keys Active" : "API Credentials"}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Razorpay Test Rails Active</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden md:block pl-1">
            {timeStr}
          </div>
        </div>
      </div>
    </header>
  );
};
