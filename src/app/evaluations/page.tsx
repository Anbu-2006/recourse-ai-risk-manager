"use client";

import React, { useState } from "react";
import { Header, NavTabType } from "@/components/Header";
import { EvaluationView } from "@/components/EvaluationView";

export default function EvaluationsPage() {
  const [activeTab, setActiveTab] = useState<NavTabType>("overview");

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          window.location.href = `/?tab=${tab}`;
        }}
      />

      <main className="w-full flex-1 py-4">
        <EvaluationView />
      </main>
    </div>
  );
}
