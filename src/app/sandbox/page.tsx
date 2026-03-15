"use client";

import { useState } from "react";
import { NeuralNetworkSandbox } from "@/components/NeuralNetworkSandbox";
import { BackpropSandbox } from "@/components/BackpropSandbox";
import { DecisionBoundarySandbox } from "@/components/DecisionBoundarySandbox";
import { ConvolutionVisualizer } from "@/components/ConvolutionVisualizer";

type TabType = "forward" | "backprop" | "boundary" | "cnn";

const tabs: { id: TabType; label: string; activeClass: string }[] = [
  { id: "forward", label: "⟶ 前向傳播", activeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { id: "backprop", label: "⟵ 反向傳播", activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "boundary", label: "◎ 決策邊界", activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "cnn", label: "▦ 卷積視覺化", activeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
];

export default function SandboxPage() {
  const [tab, setTab] = useState<TabType>("forward");

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
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                tab === t.id
                  ? t.activeClass
                  : "bg-[var(--surface)] text-[var(--foreground)]/50 border-[var(--border)] hover:text-[var(--foreground)]/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "forward" && <NeuralNetworkSandbox />}
        {tab === "backprop" && <BackpropSandbox />}
        {tab === "boundary" && <DecisionBoundarySandbox />}
        {tab === "cnn" && <ConvolutionVisualizer />}
      </div>
    </div>
  );
}
