"use client";

import { useState } from "react";
import { NeuralNetworkSandbox } from "@/components/NeuralNetworkSandbox";
import { BackpropSandbox } from "@/components/BackpropSandbox";

export default function SandboxPage() {
  const [tab, setTab] = useState<"forward" | "backprop">("forward");

  return (
    <div className="page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">神經網路沙盒</h1>
          <p className="text-[var(--foreground)]/60">
            即時視覺化神經元之間的訊號傳導過程。調整輸入值、權重和偏差，觀察訊號如何在網路中流動。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("forward")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "forward"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-[var(--surface)] text-[var(--foreground)]/50 border border-[var(--border)] hover:text-[var(--foreground)]/70"
            }`}
          >
            ⟶ 前向傳播沙盒
          </button>
          <button
            onClick={() => setTab("backprop")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "backprop"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-[var(--surface)] text-[var(--foreground)]/50 border border-[var(--border)] hover:text-[var(--foreground)]/70"
            }`}
          >
            ⟵ 反向傳播視覺化
          </button>
        </div>

        {tab === "forward" ? <NeuralNetworkSandbox /> : <BackpropSandbox />}
      </div>
    </div>
  );
}
