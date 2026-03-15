"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Tiny neural network for 2D classification ───
function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

function sigmoidDeriv(s: number) {
  return s * (1 - s);
}

function relu(x: number) {
  return Math.max(0, x);
}

function reluDeriv(x: number) {
  return x > 0 ? 1 : 0;
}

type ActivationFn = "sigmoid" | "relu" | "tanh";

function activate(x: number, fn: ActivationFn): number {
  if (fn === "sigmoid") return sigmoid(x);
  if (fn === "relu") return relu(x);
  return Math.tanh(x);
}

function activateDeriv(x: number, output: number, fn: ActivationFn): number {
  if (fn === "sigmoid") return sigmoidDeriv(output);
  if (fn === "relu") return reluDeriv(x);
  return 1 - output * output;
}

interface TinyNet {
  W1: number[][]; // hiddenSize x 2
  B1: number[];
  W2: number[][]; // 1 x hiddenSize
  B2: number[];
  hiddenSize: number;
}

function createNet(hiddenSize: number): TinyNet {
  const scale1 = Math.sqrt(2 / (2 + hiddenSize));
  const scale2 = Math.sqrt(2 / (hiddenSize + 1));
  return {
    W1: Array.from({ length: hiddenSize }, () => [
      (Math.random() * 2 - 1) * scale1,
      (Math.random() * 2 - 1) * scale1,
    ]),
    B1: new Array(hiddenSize).fill(0),
    W2: [
      Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * scale2),
    ],
    B2: [0],
    hiddenSize,
  };
}

function forward(net: TinyNet, x: number[], fn: ActivationFn) {
  const z1: number[] = [];
  const a1: number[] = [];
  for (let j = 0; j < net.hiddenSize; j++) {
    const z = net.W1[j][0] * x[0] + net.W1[j][1] * x[1] + net.B1[j];
    z1.push(z);
    a1.push(activate(z, fn));
  }

  let z2 = net.B2[0];
  for (let j = 0; j < net.hiddenSize; j++) {
    z2 += net.W2[0][j] * a1[j];
  }
  const a2 = sigmoid(z2); // output always sigmoid for binary classification

  return { z1, a1, z2, a2 };
}

function trainStep(
  net: TinyNet,
  X: number[][],
  Y: number[],
  lr: number,
  fn: ActivationFn
): number {
  let totalLoss = 0;

  // Accumulate gradients
  const dW1 = Array.from({ length: net.hiddenSize }, () => [0, 0]);
  const dB1 = new Array(net.hiddenSize).fill(0);
  const dW2 = [new Array(net.hiddenSize).fill(0)];
  const dB2 = [0];

  for (let n = 0; n < X.length; n++) {
    const { z1, a1, a2 } = forward(net, X[n], fn);
    const err = a2 - Y[n];
    totalLoss += -Y[n] * Math.log(a2 + 1e-8) - (1 - Y[n]) * Math.log(1 - a2 + 1e-8);

    // Output layer gradient
    const dz2 = err; // derivative of cross-entropy + sigmoid = (a2 - y)
    for (let j = 0; j < net.hiddenSize; j++) {
      dW2[0][j] += dz2 * a1[j];
    }
    dB2[0] += dz2;

    // Hidden layer gradient
    for (let j = 0; j < net.hiddenSize; j++) {
      const da1 = dz2 * net.W2[0][j];
      const dz1 = da1 * activateDeriv(z1[j], a1[j], fn);
      dW1[j][0] += dz1 * X[n][0];
      dW1[j][1] += dz1 * X[n][1];
      dB1[j] += dz1;
    }
  }

  // Update weights
  const m = X.length;
  for (let j = 0; j < net.hiddenSize; j++) {
    net.W1[j][0] -= (lr * dW1[j][0]) / m;
    net.W1[j][1] -= (lr * dW1[j][1]) / m;
    net.B1[j] -= (lr * dB1[j]) / m;
    net.W2[0][j] -= (lr * dW2[0][j]) / m;
  }
  net.B2[0] -= (lr * dB2[0]) / m;

  return totalLoss / m;
}

// ─── Data generators ───
type DatasetType = "circle" | "xor" | "spiral" | "moon";

function generateData(type: DatasetType, n: number): { X: number[][]; Y: number[] } {
  const X: number[][] = [];
  const Y: number[] = [];

  if (type === "circle") {
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      X.push([Math.cos(angle) * r, Math.sin(angle) * r]);
      Y.push(0);
    }
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 0.35;
      X.push([Math.cos(angle) * r, Math.sin(angle) * r]);
      Y.push(1);
    }
  } else if (type === "xor") {
    for (let i = 0; i < n * 2; i++) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const label = (x > 0) !== (y > 0) ? 1 : 0;
      X.push([x + (Math.random() - 0.5) * 0.15, y + (Math.random() - 0.5) * 0.15]);
      Y.push(label);
    }
  } else if (type === "spiral") {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * 2 * Math.PI + Math.random() * 0.3;
      const r = (t / (2 * Math.PI)) * 0.8;
      X.push([r * Math.cos(t) + (Math.random() - 0.5) * 0.08, r * Math.sin(t) + (Math.random() - 0.5) * 0.08]);
      Y.push(0);
    }
    for (let i = 0; i < n; i++) {
      const t = (i / n) * 2 * Math.PI + Math.PI + Math.random() * 0.3;
      const r = (t - Math.PI) / (2 * Math.PI) * 0.8;
      X.push([r * Math.cos(t) + (Math.random() - 0.5) * 0.08, r * Math.sin(t) + (Math.random() - 0.5) * 0.08]);
      Y.push(1);
    }
  } else {
    // moon
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI;
      X.push([
        Math.cos(angle) * 0.7 + (Math.random() - 0.5) * 0.15,
        Math.sin(angle) * 0.7 + (Math.random() - 0.5) * 0.15 - 0.1,
      ]);
      Y.push(0);
    }
    for (let i = 0; i < n; i++) {
      const angle = Math.PI + Math.random() * Math.PI;
      X.push([
        Math.cos(angle) * 0.7 + 0.5 + (Math.random() - 0.5) * 0.15,
        Math.sin(angle) * 0.7 + (Math.random() - 0.5) * 0.15 + 0.4,
      ]);
      Y.push(1);
    }
  }

  return { X, Y };
}

// ─── Component ───
export function DecisionBoundarySandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const netRef = useRef<TinyNet | null>(null);
  const dataRef = useRef<{ X: number[][]; Y: number[] }>({ X: [], Y: [] });
  const trainingRef = useRef(false);
  const animRef = useRef<number>(0);
  const epochRef = useRef(0);
  const lossHistoryRef = useRef<number[]>([]);

  const [dataset, setDataset] = useState<DatasetType>("circle");
  const [hiddenSize, setHiddenSize] = useState(6);
  const [learningRate, setLearningRate] = useState(0.5);
  const [activation, setActivation] = useState<ActivationFn>("relu");
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [stepsPerFrame, setStepsPerFrame] = useState(5);

  const resolution = 60; // grid resolution for boundary drawing

  const resetNetwork = useCallback(() => {
    trainingRef.current = false;
    setIsTraining(false);
    epochRef.current = 0;
    lossHistoryRef.current = [];
    setEpoch(0);
    setLoss(0);
    setAccuracy(0);

    const data = generateData(dataset, 80);
    dataRef.current = data;
    netRef.current = createNet(hiddenSize);

    // Initial draw
    drawCanvas();
  }, [dataset, hiddenSize]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { resetNetwork(); }, [dataset, hiddenSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const net = netRef.current;
    if (!net) return;

    const w = canvas.width;
    const h = canvas.height;
    const size = Math.min(w, h);
    const ox = (w - size) / 2;
    const oy = (h - size) / 2;

    // Map data coords [-1.2, 1.2] to canvas
    const toCanvas = (x: number, y: number) => ({
      cx: ox + ((x + 1.2) / 2.4) * size,
      cy: oy + ((1.2 - y) / 2.4) * size,
    });

    ctx.clearRect(0, 0, w, h);

    // Draw decision boundary heatmap
    const cellW = size / resolution;
    const cellH = size / resolution;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = -1.2 + (j + 0.5) * (2.4 / resolution);
        const y = 1.2 - (i + 0.5) * (2.4 / resolution);
        const { a2 } = forward(net, [x, y], activation);

        // Blue (class 0) to Orange (class 1)
        const r = Math.round(30 + a2 * 200);
        const g = Math.round(80 + (1 - Math.abs(a2 - 0.5) * 2) * 60 - a2 * 40);
        const b = Math.round(200 - a2 * 170);
        const alpha = 0.4 + Math.abs(a2 - 0.5) * 0.5;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(ox + j * cellW, oy + i * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw decision boundary contour (a2 ≈ 0.5)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < resolution - 1; i++) {
      for (let j = 0; j < resolution - 1; j++) {
        const x1 = -1.2 + (j + 0.5) * (2.4 / resolution);
        const y1 = 1.2 - (i + 0.5) * (2.4 / resolution);
        const x2 = -1.2 + (j + 1.5) * (2.4 / resolution);
        const y2 = 1.2 - (i + 1.5) * (2.4 / resolution);

        const v00 = forward(net, [x1, y1], activation).a2;
        const v10 = forward(net, [x2, y1], activation).a2;
        const v01 = forward(net, [x1, y2], activation).a2;

        // Check horizontal crossing
        if ((v00 - 0.5) * (v10 - 0.5) < 0) {
          const t = (0.5 - v00) / (v10 - v00);
          const cx = ox + (j + 0.5 + t) * cellW;
          const cy = oy + (i + 0.5) * cellH;
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Check vertical crossing
        if ((v00 - 0.5) * (v01 - 0.5) < 0) {
          const t = (0.5 - v00) / (v01 - v00);
          const cx = ox + (j + 0.5) * cellW;
          const cy = oy + (i + 0.5 + t) * cellH;
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);

    // Draw data points
    const { X, Y } = dataRef.current;
    for (let i = 0; i < X.length; i++) {
      const { cx, cy } = toCanvas(X[i][0], X[i][1]);

      // Predict for coloring correctness
      const { a2 } = forward(net, X[i], activation);
      const pred = a2 >= 0.5 ? 1 : 0;
      const correct = pred === Y[i];

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);

      if (Y[i] === 0) {
        ctx.fillStyle = "rgba(96, 165, 250, 0.9)"; // blue
      } else {
        ctx.fillStyle = "rgba(251, 146, 60, 0.9)"; // orange
      }
      ctx.fill();

      if (!correct) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("x₁", w / 2, oy + size + 16);
    ctx.save();
    ctx.translate(ox - 10, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("x₂", 0, 0);
    ctx.restore();
  }, [activation, resolution]);

  const trainLoop = useCallback(() => {
    if (!trainingRef.current || !netRef.current) return;
    const { X, Y } = dataRef.current;
    if (X.length === 0) return;

    let lastLoss = 0;
    for (let s = 0; s < stepsPerFrame; s++) {
      lastLoss = trainStep(netRef.current, X, Y, learningRate, activation);
      epochRef.current++;
    }

    lossHistoryRef.current.push(lastLoss);
    if (lossHistoryRef.current.length > 200) lossHistoryRef.current.shift();

    // Compute accuracy
    let correct = 0;
    for (let i = 0; i < X.length; i++) {
      const { a2 } = forward(netRef.current, X[i], activation);
      if ((a2 >= 0.5 ? 1 : 0) === Y[i]) correct++;
    }

    setEpoch(epochRef.current);
    setLoss(lastLoss);
    setAccuracy(correct / X.length);
    drawCanvas();

    animRef.current = requestAnimationFrame(trainLoop);
  }, [learningRate, activation, stepsPerFrame, drawCanvas]);

  const toggleTraining = useCallback(() => {
    if (trainingRef.current) {
      trainingRef.current = false;
      setIsTraining(false);
      cancelAnimationFrame(animRef.current);
    } else {
      if (!netRef.current) {
        netRef.current = createNet(hiddenSize);
      }
      trainingRef.current = true;
      setIsTraining(true);
      animRef.current = requestAnimationFrame(trainLoop);
    }
  }, [trainLoop, hiddenSize]);

  useEffect(() => {
    return () => {
      trainingRef.current = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = Math.min(rect.width, 500);
        drawCanvas();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  // Initial canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width, 500);
    }
    drawCanvas();
  }, [drawCanvas]);

  const datasets: { type: DatasetType; label: string; icon: string }[] = [
    { type: "circle", label: "同心圓", icon: "⭕" },
    { type: "xor", label: "XOR", icon: "✕" },
    { type: "spiral", label: "螺旋", icon: "🌀" },
    { type: "moon", label: "月牙", icon: "🌙" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dataset selection */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)]/70">資料集</h3>
          <div className="flex flex-wrap gap-2">
            {datasets.map((d) => (
              <button
                key={d.type}
                onClick={() => {
                  trainingRef.current = false;
                  setIsTraining(false);
                  cancelAnimationFrame(animRef.current);
                  setDataset(d.type);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  dataset === d.type
                    ? "bg-[var(--primary)]/20 text-[var(--primary-light)] border border-[var(--primary)]/30"
                    : "bg-[var(--surface-light)] text-[var(--foreground)]/50 border border-transparent hover:text-[var(--foreground)]/70"
                }`}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)]/70">超參數</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--foreground)]/40 block mb-1">隱藏神經元</label>
              <select
                value={hiddenSize}
                onChange={(e) => {
                  trainingRef.current = false;
                  setIsTraining(false);
                  cancelAnimationFrame(animRef.current);
                  setHiddenSize(Number(e.target.value));
                }}
                className="w-full px-2 py-1 rounded bg-[var(--surface-light)] border border-[var(--border)] text-sm"
              >
                {[2, 4, 6, 8, 12, 16].map((n) => (
                  <option key={n} value={n}>
                    {n} 個
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--foreground)]/40 block mb-1">激活函數</label>
              <select
                value={activation}
                onChange={(e) => setActivation(e.target.value as ActivationFn)}
                className="w-full px-2 py-1 rounded bg-[var(--surface-light)] border border-[var(--border)] text-sm"
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--foreground)]/40 block mb-1">學習率: {learningRate}</label>
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--foreground)]/40 block mb-1">每幀步數: {stepsPerFrame}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={stepsPerFrame}
                onChange={(e) => setStepsPerFrame(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Training controls and stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={toggleTraining}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            isTraining
              ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
          }`}
        >
          {isTraining ? "⏸ 暫停訓練" : "▶ 開始訓練"}
        </button>
        <button
          onClick={resetNetwork}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
        >
          重置網路
        </button>
        <div className="flex gap-4 ml-auto text-sm font-mono">
          <span className="text-[var(--foreground)]/40">
            Epoch: <span className="text-[var(--foreground)]/80">{epoch}</span>
          </span>
          <span className="text-[var(--foreground)]/40">
            Loss: <span className="text-amber-400">{loss.toFixed(4)}</span>
          </span>
          <span className="text-[var(--foreground)]/40">
            準確率: <span className={accuracy >= 0.95 ? "text-emerald-400" : accuracy >= 0.8 ? "text-amber-400" : "text-red-400"}>{(accuracy * 100).toFixed(1)}%</span>
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[#0a0f1a]">
        <canvas ref={canvasRef} className="w-full" style={{ minHeight: 400 }} />
      </div>

      {/* Loss curve */}
      {lossHistoryRef.current.length > 1 && (
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-2 text-[var(--foreground)]/70">Loss 曲線</h3>
          <div className="h-24 flex items-end gap-px">
            {(() => {
              const hist = lossHistoryRef.current;
              const maxLoss = Math.max(...hist, 0.01);
              const step = Math.max(1, Math.floor(hist.length / 120));
              const sampled = hist.filter((_, i) => i % step === 0);
              return sampled.map((l, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${Math.max(1, (l / maxLoss) * 100)}%`,
                    backgroundColor: l < 0.1 ? "rgba(52, 211, 153, 0.6)" : l < 0.5 ? "rgba(251, 191, 36, 0.6)" : "rgba(239, 68, 68, 0.6)",
                    minWidth: 1,
                    maxWidth: 6,
                  }}
                />
              ));
            })()}
          </div>
          <div className="flex justify-between text-xs text-[var(--foreground)]/30 mt-1 font-mono">
            <span>0</span>
            <span>Epoch {epoch}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-2 text-[var(--foreground)]/70">圖例說明</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[var(--foreground)]/60">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
            <span>類別 0 資料點</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
            <span>類別 1 資料點</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-red-400 inline-block" />
            <span>分類錯誤</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-3 rounded inline-block" style={{ background: "linear-gradient(90deg, rgba(30,80,200,0.6), rgba(230,106,60,0.6))" }} />
            <span>決策邊界</span>
          </div>
        </div>
        <p className="text-xs text-[var(--foreground)]/40 mt-2">
          背景顏色代表神經網路對該區域的分類結果。白色虛線標示決策邊界（輸出 = 0.5）。
          紅色邊框的資料點為當前分類錯誤的樣本。
        </p>
      </div>
    </div>
  );
}
