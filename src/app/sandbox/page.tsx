"use client";

import { NeuralNetworkSandbox } from "@/components/NeuralNetworkSandbox";

export default function SandboxPage() {
  return (
    <div className="page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">神經網路沙盒</h1>
          <p className="text-[var(--foreground)]/60">
            即時視覺化神經元之間的訊號傳導過程。調整輸入值、權重和偏差，觀察訊號如何在網路中流動。
          </p>
        </div>
        <NeuralNetworkSandbox />
      </div>
    </div>
  );
}
