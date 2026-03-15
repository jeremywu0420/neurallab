"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Predefined kernels ───
const KERNELS: { name: string; desc: string; data: number[][] }[] = [
  {
    name: "邊緣偵測",
    desc: "Sobel 水平邊緣",
    data: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
  },
  {
    name: "垂直邊緣",
    desc: "Sobel 垂直邊緣",
    data: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
  {
    name: "銳化",
    desc: "增強細節和邊緣",
    data: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  {
    name: "模糊",
    desc: "平均模糊 (低通濾波)",
    data: [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ],
  },
  {
    name: "浮雕",
    desc: "浮雕效果",
    data: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2],
    ],
  },
  {
    name: "拉普拉斯",
    desc: "全方向邊緣偵測",
    data: [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ],
  },
];

// ─── Sample images (8x8 pixel patterns) ───
function generateImage(type: string): number[][] {
  const size = 8;
  const img: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));

  if (type === "cross") {
    for (let i = 0; i < size; i++) {
      img[3][i] = 200;
      img[4][i] = 200;
      img[i][3] = 200;
      img[i][4] = 200;
    }
  } else if (type === "diagonal") {
    for (let i = 0; i < size; i++) {
      img[i][i] = 255;
      if (i + 1 < size) img[i][i + 1] = 128;
      if (i - 1 >= 0) img[i][i - 1] = 128;
    }
  } else if (type === "box") {
    for (let i = 1; i < size - 1; i++) {
      img[1][i] = 220;
      img[size - 2][i] = 220;
      img[i][1] = 220;
      img[i][size - 2] = 220;
    }
  } else if (type === "gradient") {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        img[i][j] = Math.round((j / (size - 1)) * 255);
      }
    }
  } else if (type === "checkerboard") {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        img[i][j] = (i + j) % 2 === 0 ? 220 : 30;
      }
    }
  } else {
    // circle
    const cx = 3.5, cy = 3.5, r = 2.5;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const d = Math.sqrt((i - cy) ** 2 + (j - cx) ** 2);
        if (d <= r) img[i][j] = 220;
        else if (d <= r + 0.8) img[i][j] = 100;
      }
    }
  }
  return img;
}

// ─── Convolution operation ───
function convolve(image: number[][], kernel: number[][]): number[][] {
  const ih = image.length;
  const iw = image[0].length;
  const kh = kernel.length;
  const kw = kernel[0].length;
  const oh = ih - kh + 1;
  const ow = iw - kw + 1;

  const output: number[][] = Array.from({ length: oh }, () => new Array(ow).fill(0));

  for (let i = 0; i < oh; i++) {
    for (let j = 0; j < ow; j++) {
      let sum = 0;
      for (let ki = 0; ki < kh; ki++) {
        for (let kj = 0; kj < kw; kj++) {
          sum += image[i + ki][j + kj] * kernel[ki][kj];
        }
      }
      output[i][j] = sum;
    }
  }

  return output;
}

// ─── Max pooling ───
function maxPool(input: number[][], poolSize: number = 2): number[][] {
  const h = input.length;
  const w = input[0].length;
  const oh = Math.floor(h / poolSize);
  const ow = Math.floor(w / poolSize);
  const output: number[][] = Array.from({ length: oh }, () => new Array(ow).fill(0));

  for (let i = 0; i < oh; i++) {
    for (let j = 0; j < ow; j++) {
      let maxVal = -Infinity;
      for (let pi = 0; pi < poolSize; pi++) {
        for (let pj = 0; pj < poolSize; pj++) {
          maxVal = Math.max(maxVal, input[i * poolSize + pi][j * poolSize + pj]);
        }
      }
      output[i][j] = maxVal;
    }
  }

  return output;
}

// ─── Component ───
export function ConvolutionVisualizer() {
  const [selectedKernel, setSelectedKernel] = useState(0);
  const [selectedImage, setSelectedImage] = useState("cross");
  const [scanPos, setScanPos] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [showPooling, setShowPooling] = useState(false);
  const [customKernel, setCustomKernel] = useState<number[][] | null>(null);
  const animRef = useRef<number>(0);
  const scanRef = useRef({ row: 0, col: 0 });

  const kernel = customKernel || KERNELS[selectedKernel].data;
  const image = generateImage(selectedImage);
  const featureMap = convolve(image, kernel);
  const pooledMap = showPooling ? maxPool(featureMap) : null;

  const outputH = featureMap.length;
  const outputW = featureMap[0].length;

  // Normalize feature map for display
  const fmFlat = featureMap.flat();
  const fmMin = Math.min(...fmFlat);
  const fmMax = Math.max(...fmFlat);
  const fmRange = fmMax - fmMin || 1;

  const startScan = useCallback(() => {
    if (isScanning) {
      setIsScanning(false);
      cancelAnimationFrame(animRef.current);
      return;
    }

    setIsScanning(true);
    scanRef.current = { row: 0, col: 0 };
    setScanPos({ row: 0, col: 0 });

    let frame = 0;
    const speed = 12; // frames between steps

    const tick = () => {
      frame++;
      if (frame % speed === 0) {
        let { row, col } = scanRef.current;
        col++;
        if (col >= outputW) {
          col = 0;
          row++;
        }
        if (row >= outputH) {
          setIsScanning(false);
          return;
        }
        scanRef.current = { row, col };
        setScanPos({ row, col });
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [isScanning, outputH, outputW]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const cellSize = 48;
  const kernelCellSize = 56;
  const images = [
    { id: "cross", label: "十字" },
    { id: "diagonal", label: "對角線" },
    { id: "box", label: "方框" },
    { id: "circle", label: "圓形" },
    { id: "gradient", label: "漸層" },
    { id: "checkerboard", label: "棋盤" },
  ];

  // Current scan computation detail
  const scanDetail = (() => {
    const { row, col } = scanPos;
    let sum = 0;
    const parts: { imgVal: number; kerVal: number; product: number }[] = [];
    for (let ki = 0; ki < 3; ki++) {
      for (let kj = 0; kj < 3; kj++) {
        const iv = image[row + ki]?.[col + kj] ?? 0;
        const kv = kernel[ki][kj];
        const p = iv * kv;
        parts.push({ imgVal: iv, kerVal: kv, product: p });
        sum += p;
      }
    }
    return { parts, sum };
  })();

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image selector */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)]/70">輸入影像</h3>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedImage === img.id
                    ? "bg-[var(--primary)]/20 text-[var(--primary-light)] border border-[var(--primary)]/30"
                    : "bg-[var(--surface-light)] text-[var(--foreground)]/50 border border-transparent hover:text-[var(--foreground)]/70"
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kernel selector */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)]/70">卷積核 (Filter)</h3>
          <div className="flex flex-wrap gap-2">
            {KERNELS.map((k, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedKernel(i);
                  setCustomKernel(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedKernel === i && !customKernel
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-[var(--surface-light)] text-[var(--foreground)]/50 border border-transparent hover:text-[var(--foreground)]/70"
                }`}
              >
                {k.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main visualization */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Input image grid */}
        <div className="shrink-0">
          <h4 className="text-xs font-semibold text-[var(--foreground)]/50 mb-2 text-center">輸入 (8×8)</h4>
          <div
            className="grid border border-[var(--border)] rounded-lg overflow-hidden relative"
            style={{
              gridTemplateColumns: `repeat(8, ${cellSize}px)`,
            }}
          >
            {image.map((row, i) =>
              row.map((val, j) => {
                const inKernel =
                  i >= scanPos.row &&
                  i < scanPos.row + 3 &&
                  j >= scanPos.col &&
                  j < scanPos.col + 3;

                return (
                  <div
                    key={`${i}-${j}`}
                    className="flex items-center justify-center text-xs font-mono transition-all duration-150"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: `rgba(255, 255, 255, ${val / 255 * 0.8})`,
                      color: val > 128 ? "#000" : "rgba(255,255,255,0.5)",
                      outline: inKernel ? "2px solid rgba(251, 191, 36, 0.8)" : "1px solid rgba(255,255,255,0.05)",
                      zIndex: inKernel ? 2 : 1,
                      boxShadow: inKernel ? "inset 0 0 12px rgba(251, 191, 36, 0.3)" : "none",
                    }}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Convolution operator */}
        <div className="flex flex-col items-center gap-2 self-center shrink-0">
          <span className="text-2xl text-[var(--foreground)]/30">⊛</span>

          {/* Kernel display */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--foreground)]/50 mb-2 text-center">
              卷積核 (3×3)
            </h4>
            <div
              className="grid border border-amber-500/30 rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `repeat(3, ${kernelCellSize}px)` }}
            >
              {kernel.map((row, i) =>
                row.map((val, j) => (
                  <div
                    key={`k${i}-${j}`}
                    className="flex items-center justify-center text-xs font-mono"
                    style={{
                      width: kernelCellSize,
                      height: kernelCellSize,
                      backgroundColor:
                        val > 0
                          ? `rgba(52, 211, 153, ${Math.min(Math.abs(val) / 5, 0.6)})`
                          : val < 0
                          ? `rgba(239, 68, 68, ${Math.min(Math.abs(val) / 5, 0.6)})`
                          : "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {val % 1 === 0 ? val : val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>

          <span className="text-2xl text-[var(--foreground)]/30">=</span>
        </div>

        {/* Feature map output */}
        <div className="shrink-0">
          <h4 className="text-xs font-semibold text-[var(--foreground)]/50 mb-2 text-center">
            特徵圖 ({outputH}×{outputW})
          </h4>
          <div
            className="grid border border-[var(--border)] rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${outputW}, ${cellSize}px)`,
            }}
          >
            {featureMap.map((row, i) =>
              row.map((val, j) => {
                const norm = (val - fmMin) / fmRange;
                const isActive = i === scanPos.row && j === scanPos.col;

                return (
                  <div
                    key={`o${i}-${j}`}
                    className="flex items-center justify-center text-xs font-mono cursor-pointer transition-all duration-150"
                    onClick={() => setScanPos({ row: i, col: j })}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: `rgba(96, 165, 250, ${norm * 0.8})`,
                      color: norm > 0.5 ? "#000" : "rgba(255,255,255,0.5)",
                      outline: isActive ? "2px solid rgba(96, 165, 250, 0.9)" : "1px solid rgba(255,255,255,0.05)",
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    {Math.round(val)}
                  </div>
                );
              })
            )}
          </div>

          {/* Pooling result */}
          {pooledMap && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-[var(--foreground)]/50 mb-2 text-center">
                Max Pooling (2×2) → {pooledMap.length}×{pooledMap[0].length}
              </h4>
              <div
                className="grid border border-emerald-500/30 rounded-lg overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${pooledMap[0].length}, ${cellSize}px)`,
                }}
              >
                {pooledMap.map((row, i) =>
                  row.map((val, j) => {
                    const norm = (val - fmMin) / fmRange;
                    return (
                      <div
                        key={`p${i}-${j}`}
                        className="flex items-center justify-center text-xs font-mono"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: `rgba(52, 211, 153, ${norm * 0.7})`,
                          color: norm > 0.5 ? "#000" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {Math.round(val)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={startScan}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isScanning
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
          }`}
        >
          {isScanning ? "⏸ 暫停掃描" : "▶ 自動掃描"}
        </button>
        <button
          onClick={() => setShowPooling(!showPooling)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            showPooling
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          {showPooling ? "隱藏 Pooling" : "顯示 Max Pooling"}
        </button>
        <span className="text-xs text-[var(--foreground)]/40 font-mono ml-auto">
          掃描位置: ({scanPos.row}, {scanPos.col})
        </span>
      </div>

      {/* Calculation detail */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)]/70">
          卷積計算過程 — 位置 ({scanPos.row}, {scanPos.col})
        </h3>
        <div className="flex flex-wrap gap-1 items-center text-xs font-mono">
          {scanDetail.parts.map((p, i) => (
            <span key={i} className="inline-flex items-center">
              {i > 0 && <span className="text-[var(--foreground)]/30 mx-1">+</span>}
              <span className="px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[var(--foreground)]/60">{p.imgVal}</span>
                <span className="text-[var(--foreground)]/30">×</span>
                <span className={p.kerVal >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {p.kerVal % 1 === 0 ? p.kerVal : p.kerVal.toFixed(2)}
                </span>
              </span>
            </span>
          ))}
          <span className="text-[var(--foreground)]/30 mx-2">=</span>
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold">
            {Math.round(scanDetail.sum)}
          </span>
        </div>
        <p className="text-xs text-[var(--foreground)]/40 mt-2">
          點擊特徵圖上的任一格子，即可查看對應的卷積計算細節。黃色框標示了輸入影像中被卷積核覆蓋的區域。
        </p>
      </div>

      {/* Explanation */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-2 text-[var(--foreground)]/70">卷積運算原理</h3>
        <div className="text-xs text-[var(--foreground)]/50 space-y-1">
          <p>1. 卷積核（Filter）在輸入影像上<strong className="text-[var(--foreground)]/70">逐步滑動</strong>，每次覆蓋一個 3×3 區域</p>
          <p>2. 將卷積核的每個值與影像對應位置的值<strong className="text-[var(--foreground)]/70">相乘後求和</strong>，得到特徵圖的一個值</p>
          <p>3. 不同的卷積核可以偵測不同的特徵（邊緣、紋理、形狀等）</p>
          <p>4. <strong className="text-[var(--foreground)]/70">Max Pooling</strong> 將特徵圖縮小，保留最重要的特徵資訊，減少參數量</p>
          <p>5. 在實際 CNN 中，會使用多個卷積核產生多個特徵圖，並堆疊成深層網路</p>
        </div>
      </div>
    </div>
  );
}
