"use client";

// ─── SVG diagrams for tutorials ───
// Each diagram is a self-contained SVG component that illustrates a concept.

interface DiagramProps {
  caption?: string;
}

function DiagramWrapper({ children, caption }: DiagramProps & { children: React.ReactNode }) {
  return (
    <figure className="my-8 flex flex-col items-center">
      <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[#0a0f1a] p-4 overflow-x-auto">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-[var(--foreground)]/50 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── 1. Single neuron diagram ───
function SingleNeuron({ caption }: DiagramProps) {
  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox="0 0 500 240" className="w-full" style={{ maxHeight: 260 }}>
        {/* Inputs */}
        {[0, 1, 2].map((i) => {
          const y = 50 + i * 70;
          return (
            <g key={i}>
              <circle cx={60} cy={y} r={22} fill="none" stroke="rgba(96,165,250,0.7)" strokeWidth={2} />
              <text x={60} y={y + 5} textAnchor="middle" fill="rgba(96,165,250,0.9)" fontSize={14} fontFamily="monospace">
                x{i + 1}
              </text>
              {/* Connection to neuron */}
              <line x1={82} y1={y} x2={218} y2={120} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
              {/* Weight label */}
              <text
                x={140}
                y={y + (120 - y) * 0.45 - 6}
                textAnchor="middle"
                fill="rgba(251,191,36,0.7)"
                fontSize={11}
                fontFamily="monospace"
              >
                w{i + 1}
              </text>
            </g>
          );
        })}

        {/* Neuron body */}
        <circle cx={240} cy={120} r={30} fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.7)" strokeWidth={2} />
        <text x={240} y={114} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={11} fontFamily="monospace">
          Σ + b
        </text>
        <text x={240} y={132} textAnchor="middle" fill="rgba(139,92,246,0.7)" fontSize={10} fontFamily="monospace">
          f(·)
        </text>

        {/* Arrow to output */}
        <line x1={270} y1={120} x2={380} y2={120} stroke="rgba(52,211,153,0.5)" strokeWidth={2} markerEnd="url(#arrowGreen)" />

        {/* Output */}
        <circle cx={410} cy={120} r={22} fill="none" stroke="rgba(52,211,153,0.7)" strokeWidth={2} />
        <text x={410} y={125} textAnchor="middle" fill="rgba(52,211,153,0.9)" fontSize={14} fontFamily="monospace">
          y
        </text>

        {/* Labels */}
        <text x={60} y={225} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11}>
          輸入
        </text>
        <text x={240} y={225} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11}>
          神經元
        </text>
        <text x={410} y={225} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11}>
          輸出
        </text>

        {/* Formula */}
        <text x={250} y={20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={12} fontFamily="monospace">
          y = f(w₁x₁ + w₂x₂ + w₃x₃ + b)
        </text>

        <defs>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="rgba(52,211,153,0.7)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 2. Multi-layer network ───
function MultiLayerNetwork({ caption }: DiagramProps) {
  const layers = [3, 4, 4, 2];
  const layerNames = ["輸入層", "隱藏層 1", "隱藏層 2", "輸出層"];
  const colors = ["rgba(96,165,250,0.7)", "rgba(139,92,246,0.7)", "rgba(139,92,246,0.7)", "rgba(52,211,153,0.7)"];
  const fills = ["rgba(96,165,250,0.15)", "rgba(139,92,246,0.15)", "rgba(139,92,246,0.15)", "rgba(52,211,153,0.15)"];

  const w = 520;
  const h = 280;
  const layerSpacing = w / (layers.length + 1);

  const getY = (layerIdx: number, nodeIdx: number) => {
    const count = layers[layerIdx];
    const totalH = (count - 1) * 50;
    return (h - 40) / 2 - totalH / 2 + nodeIdx * 50 + 20;
  };

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 300 }}>
        {/* Connections */}
        {layers.map((count, li) => {
          if (li === 0) return null;
          const prevCount = layers[li - 1];
          return Array.from({ length: prevCount }, (_, pi) =>
            Array.from({ length: count }, (_, ni) => (
              <line
                key={`c${li}-${pi}-${ni}`}
                x1={layerSpacing * li}
                y1={getY(li - 1, pi)}
                x2={layerSpacing * (li + 1)}
                y2={getY(li, ni)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
            ))
          );
        })}

        {/* Neurons */}
        {layers.map((count, li) =>
          Array.from({ length: count }, (_, ni) => (
            <g key={`n${li}-${ni}`}>
              <circle
                cx={layerSpacing * (li + 1)}
                cy={getY(li, ni)}
                r={18}
                fill={fills[li]}
                stroke={colors[li]}
                strokeWidth={1.5}
              />
            </g>
          ))
        )}

        {/* Layer labels */}
        {layers.map((_, li) => (
          <text
            key={`l${li}`}
            x={layerSpacing * (li + 1)}
            y={h - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize={10}
          >
            {layerNames[li]}
          </text>
        ))}
      </svg>
    </DiagramWrapper>
  );
}

// ─── 3. Activation functions ───
function ActivationFunctions({ caption }: DiagramProps) {
  const w = 520;
  const h = 200;
  const cx = w / 2;
  const cy = h / 2;
  const scaleX = 30;
  const scaleY = 70;

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const relu = (x: number) => Math.max(0, x);
  const tanh_ = (x: number) => Math.tanh(x);

  const toPath = (fn: (x: number) => number, xMin: number, xMax: number) => {
    const points: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = xMin + (i / 80) * (xMax - xMin);
      const px = cx + x * scaleX;
      const py = cy - fn(x) * scaleY;
      points.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return points.join(" ");
  };

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* Grid */}
        <line x1={cx - 160} y1={cy} x2={cx + 160} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={cx} y1={20} x2={cx} y2={h - 20} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

        {/* Axis labels */}
        <text x={cx + 165} y={cy + 4} fill="rgba(255,255,255,0.3)" fontSize={11}>x</text>
        <text x={cx + 5} y={25} fill="rgba(255,255,255,0.3)" fontSize={11}>y</text>

        {/* y = 0, 1 lines */}
        <line x1={cx - 150} y1={cy - scaleY} x2={cx + 150} y2={cy - scaleY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
        <text x={cx - 160} y={cy - scaleY + 4} fill="rgba(255,255,255,0.2)" fontSize={9}>1</text>
        <text x={cx - 168} y={cy + 4} fill="rgba(255,255,255,0.2)" fontSize={9}>0</text>

        {/* Sigmoid */}
        <path d={toPath(sigmoid, -5, 5)} fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth={2} />
        {/* ReLU */}
        <path d={toPath(relu, -5, 5)} fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth={2} />
        {/* Tanh */}
        <path d={toPath(tanh_, -5, 5)} fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth={2} />

        {/* Legend */}
        <g transform={`translate(${w - 130}, 20)`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke="rgba(96,165,250,0.8)" strokeWidth={2} />
          <text x={25} y={4} fill="rgba(96,165,250,0.8)" fontSize={11}>Sigmoid</text>
          <line x1={0} y1={20} x2={20} y2={20} stroke="rgba(52,211,153,0.8)" strokeWidth={2} />
          <text x={25} y={24} fill="rgba(52,211,153,0.8)" fontSize={11}>ReLU</text>
          <line x1={0} y1={40} x2={20} y2={40} stroke="rgba(251,191,36,0.8)" strokeWidth={2} />
          <text x={25} y={44} fill="rgba(251,191,36,0.8)" fontSize={11}>Tanh</text>
        </g>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 4. Gradient descent visualization ───
function GradientDescentDiagram({ caption }: DiagramProps) {
  const w = 520;
  const h = 220;

  // Loss curve: a quadratic
  const points: [number, number][] = [];
  for (let i = 0; i <= 100; i++) {
    const x = 40 + (i / 100) * 440;
    const t = (i - 50) / 50; // -1 to 1
    const y = 180 - (1 - t * t) * 140;
    points.push([x, y]);
  }
  const curvePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  // Gradient descent steps
  const steps = [15, 28, 38, 44, 48, 50];

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 240 }}>
        {/* Axes */}
        <line x1={40} y1={190} x2={490} y2={190} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={40} y1={190} x2={40} y2={20} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <text x={265} y={210} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11}>權重 (w)</text>
        <text x={18} y={105} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11} transform="rotate(-90, 18, 105)">Loss</text>

        {/* Loss curve */}
        <path d={curvePath} fill="none" stroke="rgba(96,165,250,0.6)" strokeWidth={2} />

        {/* Gradient descent steps */}
        {steps.map((s, i) => {
          const x = 40 + (s / 100) * 440;
          const t = (s - 50) / 50;
          const y = 180 - (1 - t * t) * 140;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={5} fill={i === steps.length - 1 ? "rgba(52,211,153,0.8)" : "rgba(251,191,36,0.8)"} />
              {i < steps.length - 1 && (
                <line
                  x1={x}
                  y1={y}
                  x2={40 + (steps[i + 1] / 100) * 440}
                  y2={180 - (1 - ((steps[i + 1] - 50) / 50) ** 2) * 140}
                  stroke="rgba(251,191,36,0.4)"
                  strokeWidth={1.5}
                  strokeDasharray="4"
                  markerEnd="url(#arrowYellow)"
                />
              )}
            </g>
          );
        })}

        {/* Label */}
        <text x={40 + (50 / 100) * 440} y={52} textAnchor="middle" fill="rgba(52,211,153,0.6)" fontSize={10}>
          最小值
        </text>

        <text x={40 + (15 / 100) * 440} y={points[15][1] - 12} textAnchor="middle" fill="rgba(251,191,36,0.7)" fontSize={10}>
          起始點
        </text>

        <defs>
          <marker id="arrowYellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(251,191,36,0.5)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 5. Forward/Backward propagation flow ───
function BackpropFlow({ caption }: DiagramProps) {
  const w = 520;
  const h = 160;

  const boxes = [
    { label: "輸入", sublabel: "x", x: 30, color: "rgba(96,165,250,0.7)", fill: "rgba(96,165,250,0.15)" },
    { label: "隱藏層", sublabel: "h = f(Wx + b)", x: 150, color: "rgba(139,92,246,0.7)", fill: "rgba(139,92,246,0.15)" },
    { label: "輸出", sublabel: "ŷ = g(Vh + c)", x: 290, color: "rgba(52,211,153,0.7)", fill: "rgba(52,211,153,0.15)" },
    { label: "Loss", sublabel: "L(ŷ, y)", x: 420, color: "rgba(239,68,68,0.7)", fill: "rgba(239,68,68,0.15)" },
  ];

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 180 }}>
        {/* Boxes */}
        {boxes.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={30} width={80} height={50} rx={8} fill={b.fill} stroke={b.color} strokeWidth={1.5} />
            <text x={b.x + 40} y={52} textAnchor="middle" fill={b.color} fontSize={11} fontWeight="bold">
              {b.label}
            </text>
            <text x={b.x + 40} y={68} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace">
              {b.sublabel}
            </text>
          </g>
        ))}

        {/* Forward arrows (top) */}
        {[0, 1, 2].map((i) => (
          <g key={`f${i}`}>
            <line
              x1={boxes[i].x + 80}
              y1={45}
              x2={boxes[i + 1].x}
              y2={45}
              stroke="rgba(96,165,250,0.4)"
              strokeWidth={2}
              markerEnd="url(#arrowBlue)"
            />
          </g>
        ))}

        {/* Backward arrows (bottom) */}
        {[2, 1, 0].map((i) => (
          <g key={`b${i}`}>
            <line
              x1={boxes[i + 1].x}
              y1={70}
              x2={boxes[i].x + 80}
              y2={70}
              stroke="rgba(251,191,36,0.4)"
              strokeWidth={2}
              strokeDasharray="5"
              markerEnd="url(#arrowOrange)"
            />
          </g>
        ))}

        {/* Labels */}
        <text x={w / 2} y={22} textAnchor="middle" fill="rgba(96,165,250,0.6)" fontSize={10}>
          → 前向傳播 (Forward Pass)
        </text>
        <text x={w / 2} y={100} textAnchor="middle" fill="rgba(251,191,36,0.6)" fontSize={10}>
          ← 反向傳播 (Backward Pass): 計算 ∂L/∂W
        </text>

        {/* Update step */}
        <text x={w / 2} y={130} textAnchor="middle" fill="rgba(52,211,153,0.5)" fontSize={10} fontFamily="monospace">
          更新：W ← W - η · ∂L/∂W
        </text>

        <defs>
          <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(96,165,250,0.5)" />
          </marker>
          <marker id="arrowOrange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(251,191,36,0.5)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 6. CNN architecture ───
function CNNArchitecture({ caption }: DiagramProps) {
  const w = 540;
  const h = 200;

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* Input image */}
        <rect x={20} y={40} width={60} height={60} rx={4} fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.5)" strokeWidth={1.5} />
        <rect x={26} y={46} width={48} height={48} rx={2} fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth={1} strokeDasharray="3" />
        <text x={50} y={120} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>輸入影像</text>

        {/* Conv + Pool 1 */}
        <g transform="translate(120, 30)">
          <rect x={0} y={10} width={45} height={55} rx={4} fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.5)" strokeWidth={1.5} />
          <rect x={6} y={16} width={45} height={55} rx={4} fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth={1} />
          <rect x={12} y={22} width={45} height={55} rx={4} fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth={1} />
          <text x={28} y={100} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>Conv</text>
        </g>

        {/* Arrow */}
        <line x1={190} y1={65} x2={210} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arrowWhite)" />

        {/* Pool */}
        <g transform="translate(215, 40)">
          <rect x={0} y={5} width={35} height={40} rx={4} fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.5)" strokeWidth={1.5} />
          <rect x={5} y={10} width={35} height={40} rx={4} fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth={1} />
          <text x={20} y={72} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>Pool</text>
        </g>

        <line x1={260} y1={65} x2={280} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arrowWhite)" />

        {/* Conv + Pool 2 */}
        <g transform="translate(285, 35)">
          <rect x={0} y={8} width={35} height={44} rx={4} fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.5)" strokeWidth={1.5} />
          <rect x={5} y={13} width={35} height={44} rx={4} fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth={1} />
          <rect x={10} y={18} width={35} height={44} rx={4} fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth={1} />
          <rect x={15} y={23} width={35} height={44} rx={4} fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth={1} />
          <text x={20} y={82} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>Conv</text>
        </g>

        <line x1={340} y1={65} x2={360} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arrowWhite)" />

        {/* Flatten + FC */}
        <g transform="translate(365, 25)">
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={10} cy={10 + i * 10} r={4} fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.5)" strokeWidth={1} />
          ))}
          <text x={10} y={105} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>展平</text>
        </g>

        <line x1={385} y1={65} x2={410} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arrowWhite)" />

        {/* FC layers */}
        <g transform="translate(415, 35)">
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={10} cy={5 + i * 14} r={5} fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.5)" strokeWidth={1} />
          ))}
          <text x={10} y={90} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>全連接</text>
        </g>

        <line x1={435} y1={65} x2={460} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arrowWhite)" />

        {/* Output */}
        <g transform="translate(465, 45)">
          {Array.from({ length: 3 }, (_, i) => (
            <circle key={i} cx={10} cy={5 + i * 16} r={6} fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.6)" strokeWidth={1.5} />
          ))}
          <text x={10} y={70} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>輸出</text>
        </g>

        {/* Title */}
        <text x={w / 2} y={180} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>
          輸入 → 卷積 → 池化 → 卷積 → 池化 → 展平 → 全連接 → 輸出
        </text>

        <defs>
          <marker id="arrowWhite" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 7. Overfitting diagram ───
function OverfittingDiagram({ caption }: DiagramProps) {
  const w = 520;
  const h = 200;

  // Generate "true" curve and noisy data
  const trueCurve: [number, number][] = [];
  for (let i = 0; i <= 50; i++) {
    const x = 60 + (i / 50) * 200;
    const y = 160 - Math.sin((i / 50) * Math.PI) * 100;
    trueCurve.push([x, y]);
  }

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* Underfitting */}
        <g>
          <text x={160} y={18} textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize={11}>欠擬合</text>
          <line x1={70} y1={140} x2={250} y2={60} stroke="rgba(239,68,68,0.5)" strokeWidth={2} />
          {/* Data points */}
          {trueCurve.filter((_, i) => i % 5 === 0).map(([x, y], i) => (
            <circle key={`u${i}`} cx={x} cy={y + (Math.random() - 0.5) * 20} r={3} fill="rgba(255,255,255,0.4)" />
          ))}
        </g>

        {/* Good fit */}
        <g transform="translate(160, 0)">
          <text x={160} y={18} textAnchor="middle" fill="rgba(52,211,153,0.7)" fontSize={11}>適度擬合</text>
          {trueCurve.map(([x, y], i) => {
            if (i === 0) return null;
            const [px, py] = trueCurve[i - 1];
            return (
              <line key={`g${i}`} x1={px} y1={py} x2={x} y2={y} stroke="rgba(52,211,153,0.5)" strokeWidth={2} />
            );
          })}
          {trueCurve.filter((_, i) => i % 5 === 0).map(([x, y], i) => (
            <circle key={`g${i}`} cx={x} cy={y + (Math.random() - 0.5) * 20} r={3} fill="rgba(255,255,255,0.4)" />
          ))}
        </g>

        {/* Overfitting */}
        <g transform="translate(320, 0)">
          <text x={100} y={18} textAnchor="middle" fill="rgba(251,191,36,0.7)" fontSize={11}>過擬合</text>
          {/* Wiggly line through all points */}
          {trueCurve.filter((_, i) => i % 5 === 0).map(([x, y], i, arr) => {
            const ny = y + (Math.sin(i * 3) * 25);
            if (i === 0) return <circle key={`o${i}`} cx={x - 60} cy={ny} r={3} fill="rgba(255,255,255,0.4)" />;
            const [px, py2] = arr[i - 1];
            const pny = py2 + (Math.sin((i - 1) * 3) * 25);
            return (
              <g key={`o${i}`}>
                <line x1={px - 60} y1={pny} x2={x - 60} y2={ny} stroke="rgba(251,191,36,0.5)" strokeWidth={2} />
                <circle cx={x - 60} cy={ny} r={3} fill="rgba(255,255,255,0.4)" />
              </g>
            );
          })}
        </g>

        {/* Loss curves at bottom */}
        <text x={w / 2} y={190} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9}>
          欠擬合：模型太簡單 → 適度擬合：恰到好處 → 過擬合：模型太複雜
        </text>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 8. RNN unrolled diagram ───
function RNNUnrolled({ caption }: DiagramProps) {
  const w = 520;
  const h = 180;
  const steps = 4;
  const spacing = 110;
  const startX = 50;

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 200 }}>
        {Array.from({ length: steps }, (_, t) => {
          const x = startX + t * spacing;
          return (
            <g key={t}>
              {/* Hidden state box */}
              <rect x={x} y={50} width={60} height={40} rx={6} fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.6)" strokeWidth={1.5} />
              <text x={x + 30} y={73} textAnchor="middle" fill="rgba(139,92,246,0.8)" fontSize={11} fontFamily="monospace">
                h{t}
              </text>

              {/* Input arrow from bottom */}
              <line x1={x + 30} y1={140} x2={x + 30} y2={93} stroke="rgba(96,165,250,0.4)" strokeWidth={1.5} markerEnd="url(#arrowBlue2)" />
              <text x={x + 30} y={155} textAnchor="middle" fill="rgba(96,165,250,0.6)" fontSize={10} fontFamily="monospace">
                x{t}
              </text>

              {/* Output arrow to top */}
              <line x1={x + 30} y1={50} x2={x + 30} y2={25} stroke="rgba(52,211,153,0.4)" strokeWidth={1.5} markerEnd="url(#arrowGreen2)" />
              <text x={x + 30} y={18} textAnchor="middle" fill="rgba(52,211,153,0.6)" fontSize={10} fontFamily="monospace">
                y{t}
              </text>

              {/* Recurrent connection to next */}
              {t < steps - 1 && (
                <line x1={x + 60} y1={70} x2={x + spacing} y2={70} stroke="rgba(251,191,36,0.5)" strokeWidth={2} markerEnd="url(#arrowYellow2)" />
              )}
            </g>
          );
        })}

        {/* Time label */}
        <text x={w / 2} y={h - 2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9}>
          時間展開：每個時間步共享相同的權重 W
        </text>

        <defs>
          <marker id="arrowBlue2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(96,165,250,0.5)" />
          </marker>
          <marker id="arrowGreen2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(52,211,153,0.5)" />
          </marker>
          <marker id="arrowYellow2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(251,191,36,0.6)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 9. Perceptron decision boundary + XOR ───
function PerceptronBoundary({ caption }: DiagramProps) {
  const w = 540;
  const h = 240;

  // AND gate data
  const andData = [
    { x: 0, y: 0, label: 0 },
    { x: 0, y: 1, label: 0 },
    { x: 1, y: 0, label: 0 },
    { x: 1, y: 1, label: 1 },
  ];

  // XOR data
  const xorData = [
    { x: 0, y: 0, label: 0 },
    { x: 0, y: 1, label: 1 },
    { x: 1, y: 0, label: 1 },
    { x: 1, y: 1, label: 0 },
  ];

  const plotSize = 160;
  const pad = 30;

  const renderPlot = (
    data: typeof andData,
    offsetX: number,
    title: string,
    lineStart?: [number, number],
    lineEnd?: [number, number],
    canSeparate?: boolean
  ) => {
    const toX = (v: number) => offsetX + pad + v * (plotSize - 2 * pad);
    const toY = (v: number) => 40 + (1 - v) * (plotSize - 2 * pad);

    return (
      <g>
        <text x={offsetX + plotSize / 2} y={25} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={12} fontWeight="bold">
          {title}
        </text>

        {/* Axes */}
        <line x1={offsetX + pad} y1={40 + plotSize - 2 * pad} x2={offsetX + plotSize - pad + 10} y2={40 + plotSize - 2 * pad} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={offsetX + pad} y1={40 + plotSize - 2 * pad} x2={offsetX + pad} y2={30} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

        {/* Decision boundary */}
        {lineStart && lineEnd && (
          <line
            x1={toX(lineStart[0])}
            y1={toY(lineStart[1])}
            x2={toX(lineEnd[0])}
            y2={toY(lineEnd[1])}
            stroke={canSeparate ? "rgba(52,211,153,0.6)" : "rgba(239,68,68,0.6)"}
            strokeWidth={2}
            strokeDasharray={canSeparate ? "0" : "6"}
          />
        )}

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={toX(d.x)}
              cy={toY(d.y)}
              r={10}
              fill={d.label === 1 ? "rgba(251,191,36,0.3)" : "rgba(96,165,250,0.3)"}
              stroke={d.label === 1 ? "rgba(251,191,36,0.8)" : "rgba(96,165,250,0.8)"}
              strokeWidth={2}
            />
            <text x={toX(d.x)} y={toY(d.y) + 4} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10} fontWeight="bold">
              {d.label}
            </text>
          </g>
        ))}

        {/* Status */}
        <text
          x={offsetX + plotSize / 2}
          y={plotSize + 30}
          textAnchor="middle"
          fill={canSeparate ? "rgba(52,211,153,0.7)" : "rgba(239,68,68,0.7)"}
          fontSize={10}
        >
          {canSeparate ? "✓ 可線性分割" : "✗ 無法線性分割"}
        </text>
      </g>
    );
  };

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 260 }}>
        {/* AND gate - linearly separable */}
        {renderPlot(andData, 20, "AND 閘", [-0.1, 0.7], [1.1, 0.3], true)}

        {/* OR gate */}
        {renderPlot(
          [
            { x: 0, y: 0, label: 0 },
            { x: 0, y: 1, label: 1 },
            { x: 1, y: 0, label: 1 },
            { x: 1, y: 1, label: 1 },
          ],
          190,
          "OR 閘",
          [-0.1, 0.3], [0.7, -0.1],
          true
        )}

        {/* XOR - NOT linearly separable */}
        {renderPlot(xorData, 360, "XOR 閘", [-0.1, 0.5], [1.1, 0.5], false)}
      </svg>
    </DiagramWrapper>
  );
}

// ─── 10. Loss functions comparison ───
function LossFunctions({ caption }: DiagramProps) {
  const w = 520;
  const h = 220;

  const plotW = 200;
  const plotH = 150;

  const renderLossPlot = (
    offsetX: number,
    title: string,
    fn: (pred: number, actual: number) => number,
    color: string
  ) => {
    // Plot loss for actual=1, varying prediction from 0.01 to 0.99
    const points: [number, number][] = [];
    const maxLoss = fn(0.01, 1);
    for (let i = 0; i <= 50; i++) {
      const pred = 0.01 + (i / 50) * 0.98;
      const loss = fn(pred, 1);
      const x = offsetX + 30 + (i / 50) * (plotW - 50);
      const y = 40 + (1 - loss / maxLoss) * (plotH - 20);
      points.push([x, y]);
    }
    const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

    return (
      <g>
        <text x={offsetX + plotW / 2} y={25} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11} fontWeight="bold">
          {title}
        </text>

        {/* Axes */}
        <line x1={offsetX + 30} y1={40 + plotH - 20} x2={offsetX + plotW - 15} y2={40 + plotH - 20} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={offsetX + 30} y1={40 + plotH - 20} x2={offsetX + 30} y2={35} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

        {/* Labels */}
        <text x={offsetX + plotW / 2} y={40 + plotH} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>
          預測值 (ŷ)
        </text>
        <text x={offsetX + 15} y={40 + plotH / 2 - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} transform={`rotate(-90, ${offsetX + 15}, ${40 + plotH / 2 - 10})`}>
          Loss
        </text>

        {/* Curve */}
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} />

        {/* Annotation */}
        <text x={offsetX + plotW - 25} y={40 + plotH - 30} textAnchor="end" fill={color} fontSize={9}>
          y=1
        </text>
      </g>
    );
  };

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 240 }}>
        {/* MSE */}
        {renderLossPlot(
          20,
          "MSE 損失",
          (pred, actual) => (pred - actual) ** 2,
          "rgba(96,165,250,0.8)"
        )}

        {/* Cross-Entropy */}
        {renderLossPlot(
          280,
          "交叉熵損失",
          (pred, actual) => -(actual * Math.log(pred + 1e-8)),
          "rgba(251,191,36,0.8)"
        )}

        <text x={w / 2} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9}>
          當真實標籤 y=1 時，預測越接近 1，損失越小。交叉熵對錯誤預測的懲罰更大。
        </text>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 11. Dropout visualization ───
function DropoutDiagram({ caption }: DiagramProps) {
  const w = 520;
  const h = 220;

  const layers = [3, 5, 5, 2];
  const layerSpacing = 110;
  const startX = 50;

  // Deterministic "random" dropout pattern
  const droppedNeurons = new Set(["1-1", "1-3", "2-0", "2-4"]);

  const getY = (layerIdx: number, nodeIdx: number) => {
    const count = layers[layerIdx];
    const totalH = (count - 1) * 32;
    return 100 - totalH / 2 + nodeIdx * 32;
  };

  const renderNetwork = (offsetX: number, dropout: boolean, title: string) => (
    <g>
      <text x={offsetX + (layers.length - 1) * layerSpacing / 2 + startX} y={18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11} fontWeight="bold">
        {title}
      </text>

      {/* Connections */}
      {layers.map((count, li) => {
        if (li === 0) return null;
        const prevCount = layers[li - 1];
        return Array.from({ length: prevCount }, (_, pi) => {
          if (dropout && droppedNeurons.has(`${li - 1}-${pi}`)) return null;
          return Array.from({ length: count }, (_, ni) => {
            if (dropout && droppedNeurons.has(`${li}-${ni}`)) return null;
            return (
              <line
                key={`c${li}-${pi}-${ni}`}
                x1={offsetX + startX + (li - 1) * layerSpacing}
                y1={getY(li - 1, pi)}
                x2={offsetX + startX + li * layerSpacing}
                y2={getY(li, ni)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
            );
          });
        });
      })}

      {/* Neurons */}
      {layers.map((count, li) =>
        Array.from({ length: count }, (_, ni) => {
          const isDropped = dropout && droppedNeurons.has(`${li}-${ni}`);
          return (
            <g key={`n${li}-${ni}`}>
              <circle
                cx={offsetX + startX + li * layerSpacing}
                cy={getY(li, ni)}
                r={12}
                fill={isDropped ? "rgba(239,68,68,0.08)" : "rgba(139,92,246,0.15)"}
                stroke={isDropped ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.6)"}
                strokeWidth={isDropped ? 1 : 1.5}
                strokeDasharray={isDropped ? "3" : "0"}
              />
              {isDropped && (
                <text
                  x={offsetX + startX + li * layerSpacing}
                  y={getY(li, ni) + 4}
                  textAnchor="middle"
                  fill="rgba(239,68,68,0.6)"
                  fontSize={12}
                >
                  ✕
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 240 }}>
        <g transform="translate(-70, 10)">
          {renderNetwork(0, false, "完整網路（測試時）")}
        </g>
        <g transform="translate(200, 10)">
          {renderNetwork(0, true, "Dropout 網路（訓練時）")}
        </g>

        {/* Legend */}
        <g transform={`translate(${w / 2 - 80}, ${h - 20})`}>
          <circle cx={0} cy={0} r={5} fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.6)" strokeWidth={1.5} />
          <text x={10} y={4} fill="rgba(255,255,255,0.4)" fontSize={9}>活躍</text>
          <circle cx={60} cy={0} r={5} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.4)" strokeWidth={1} strokeDasharray="3" />
          <text x={70} y={4} fill="rgba(255,255,255,0.4)" fontSize={9}>被關閉</text>
        </g>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 12. Momentum/Adam optimizer paths ───
function OptimizerPaths({ caption }: DiagramProps) {
  const w = 520;
  const h = 260;

  // Contour-like ellipses centered at (260, 130) - the minimum
  const cx = 260;
  const cy = 130;

  // SGD path (zigzag)
  const sgdPath = [
    [80, 50], [120, 180], [160, 70], [195, 170], [225, 90], [245, 155], [255, 115], [258, 135], [260, 130],
  ];

  // Momentum path (smoother, wider curve)
  const momentumPath = [
    [80, 50], [140, 160], [190, 80], [230, 140], [250, 110], [258, 132], [260, 130],
  ];

  // Adam path (direct)
  const adamPath = [
    [80, 50], [130, 100], [180, 110], [220, 120], [245, 128], [260, 130],
  ];

  const pathToSvg = (pts: number[][]) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 280 }}>
        {/* Contour ellipses */}
        {[140, 100, 65, 35, 12].map((r, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={r * 1.8}
            ry={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Minimum point */}
        <circle cx={cx} cy={cy} r={4} fill="rgba(52,211,153,0.8)" />
        <text x={cx} y={cy + 18} textAnchor="middle" fill="rgba(52,211,153,0.6)" fontSize={9}>
          最小值
        </text>

        {/* SGD path */}
        <path d={pathToSvg(sgdPath)} fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth={2} strokeDasharray="4" />
        {sgdPath.map(([x, y], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r={2.5} fill="rgba(239,68,68,0.8)" />
        ))}

        {/* Momentum path */}
        <path d={pathToSvg(momentumPath)} fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth={2} />
        {momentumPath.map(([x, y], i) => (
          <circle key={`m${i}`} cx={x} cy={y} r={2.5} fill="rgba(251,191,36,0.8)" />
        ))}

        {/* Adam path */}
        <path d={pathToSvg(adamPath)} fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth={2.5} />
        {adamPath.map(([x, y], i) => (
          <circle key={`a${i}`} cx={x} cy={y} r={3} fill="rgba(96,165,250,0.9)" />
        ))}

        {/* Start point */}
        <circle cx={80} cy={50} r={5} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <text x={80} y={38} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={9}>起始點</text>

        {/* Legend */}
        <g transform={`translate(${w - 140}, 20)`}>
          <line x1={0} y1={0} x2={18} y2={0} stroke="rgba(239,68,68,0.6)" strokeWidth={2} strokeDasharray="4" />
          <text x={24} y={4} fill="rgba(239,68,68,0.7)" fontSize={10}>SGD</text>

          <line x1={0} y1={20} x2={18} y2={20} stroke="rgba(251,191,36,0.6)" strokeWidth={2} />
          <text x={24} y={24} fill="rgba(251,191,36,0.7)" fontSize={10}>Momentum</text>

          <line x1={0} y1={40} x2={18} y2={40} stroke="rgba(96,165,250,0.8)" strokeWidth={2.5} />
          <text x={24} y={44} fill="rgba(96,165,250,0.8)" fontSize={10}>Adam</text>
        </g>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 13. Convolution step-by-step ───
function ConvolutionStep({ caption }: DiagramProps) {
  const w = 520;
  const h = 240;
  const cs = 30; // cell size

  // 5x5 input
  const input = [
    [1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1],
  ];

  // 3x3 kernel
  const kernel = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1],
  ];

  // Highlight position (1,1)
  const hi = 1;
  const hj = 1;

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 260 }}>
        {/* Input grid */}
        <text x={95} y={18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>輸入 (5×5)</text>
        {input.map((row, i) =>
          row.map((val, j) => {
            const inKernel = i >= hi && i < hi + 3 && j >= hj && j < hj + 3;
            return (
              <g key={`i${i}-${j}`}>
                <rect
                  x={20 + j * cs}
                  y={28 + i * cs}
                  width={cs}
                  height={cs}
                  fill={inKernel ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.03)"}
                  stroke={inKernel ? "rgba(251,191,36,0.6)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={inKernel ? 2 : 1}
                />
                <text
                  x={20 + j * cs + cs / 2}
                  y={28 + i * cs + cs / 2 + 4}
                  textAnchor="middle"
                  fill={inKernel ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"}
                  fontSize={11}
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })
        )}

        {/* Multiply sign */}
        <text x={195} y={105} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={20}>⊙</text>

        {/* Kernel grid */}
        <text x={265} y={50} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>卷積核 (3×3)</text>
        {kernel.map((row, i) =>
          row.map((val, j) => (
            <g key={`k${i}-${j}`}>
              <rect
                x={220 + j * cs}
                y={58 + i * cs}
                width={cs}
                height={cs}
                fill={val > 0 ? "rgba(52,211,153,0.15)" : val < 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)"}
                stroke="rgba(251,191,36,0.4)"
                strokeWidth={1}
              />
              <text
                x={220 + j * cs + cs / 2}
                y={58 + i * cs + cs / 2 + 4}
                textAnchor="middle"
                fill={val > 0 ? "rgba(52,211,153,0.8)" : val < 0 ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.4)"}
                fontSize={11}
                fontFamily="monospace"
              >
                {val}
              </text>
            </g>
          ))
        )}

        {/* Equals sign */}
        <text x={345} y={105} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={20}>=</text>

        {/* Calculation detail */}
        <g>
          <text x={430} y={55} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10}>逐元素相乘求和</text>

          <text x={380} y={80} textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace">
            0×1 + 1×0 + 0×(-1)
          </text>
          <text x={380} y={98} textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace">
            +1×1 + 0×0 + 1×(-1)
          </text>
          <text x={380} y={116} textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace">
            +0×1 + 1×0 + 0×(-1)
          </text>

          <line x1={380} y1={124} x2={500} y2={124} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

          <text x={430} y={142} textAnchor="middle" fill="rgba(96,165,250,0.8)" fontSize={13} fontFamily="monospace" fontWeight="bold">
            = 0
          </text>
        </g>

        {/* Output grid hint */}
        <text x={w / 2} y={h - 15} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9}>
          卷積核在輸入上滑動，每個位置做逐元素乘積求和，產生 3×3 的特徵圖
        </text>

        {/* Arrow showing sliding */}
        <text x={95} y={195} textAnchor="middle" fill="rgba(251,191,36,0.5)" fontSize={9}>
          ↗ 黃框 = 目前掃描位置
        </text>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 14. Max Pooling ───
function MaxPoolingDiagram({ caption }: DiagramProps) {
  const w = 520;
  const h = 200;
  const cs = 36;

  const input = [
    [1, 5, 3, 2],
    [8, 2, 4, 1],
    [3, 7, 6, 9],
    [0, 4, 2, 5],
  ];

  const poolColors = [
    "rgba(96,165,250,0.15)",
    "rgba(52,211,153,0.15)",
    "rgba(251,191,36,0.15)",
    "rgba(239,68,68,0.15)",
  ];

  const poolBorders = [
    "rgba(96,165,250,0.5)",
    "rgba(52,211,153,0.5)",
    "rgba(251,191,36,0.5)",
    "rgba(239,68,68,0.5)",
  ];

  const maxVals = [
    [8, 4],
    [7, 9],
  ];

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
        <text x={120} y={22} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>特徵圖 (4×4)</text>

        {/* Input grid with pool regions */}
        {input.map((row, i) =>
          row.map((val, j) => {
            const poolIdx = Math.floor(i / 2) * 2 + Math.floor(j / 2);
            const isMax = val === maxVals[Math.floor(i / 2)][Math.floor(j / 2)];
            return (
              <g key={`p${i}-${j}`}>
                <rect
                  x={48 + j * cs}
                  y={32 + i * cs}
                  width={cs}
                  height={cs}
                  fill={poolColors[poolIdx]}
                  stroke={poolBorders[poolIdx]}
                  strokeWidth={isMax ? 2.5 : 1}
                />
                <text
                  x={48 + j * cs + cs / 2}
                  y={32 + i * cs + cs / 2 + 5}
                  textAnchor="middle"
                  fill={isMax ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
                  fontSize={isMax ? 14 : 12}
                  fontFamily="monospace"
                  fontWeight={isMax ? "bold" : "normal"}
                >
                  {val}
                </text>
              </g>
            );
          })
        )}

        {/* Arrow */}
        <text x={230} y={108} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={14}>→</text>
        <text x={230} y={125} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>Max</text>
        <text x={230} y={138} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>Pool</text>
        <text x={230} y={151} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>2×2</text>

        {/* Output grid */}
        <text x={330} y={55} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>輸出 (2×2)</text>

        {maxVals.map((row, i) =>
          row.map((val, j) => {
            const poolIdx = i * 2 + j;
            return (
              <g key={`o${i}-${j}`}>
                <rect
                  x={285 + j * (cs + 8)}
                  y={65 + i * (cs + 8)}
                  width={cs + 8}
                  height={cs + 8}
                  rx={4}
                  fill={poolColors[poolIdx]}
                  stroke={poolBorders[poolIdx]}
                  strokeWidth={2}
                />
                <text
                  x={285 + j * (cs + 8) + (cs + 8) / 2}
                  y={65 + i * (cs + 8) + (cs + 8) / 2 + 5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.9)"
                  fontSize={16}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {val}
                </text>
              </g>
            );
          })
        )}

        <text x={w / 2} y={h - 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9}>
          每個 2×2 區域取最大值，尺寸縮小一半，保留最重要的特徵
        </text>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 15. LSTM gate structure ───
function LSTMGates({ caption }: DiagramProps) {
  const w = 540;
  const h = 280;

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 300 }}>
        {/* Cell state line (top) */}
        <line x1={30} y1={40} x2={510} y2={40} stroke="rgba(52,211,153,0.5)" strokeWidth={3} />
        <text x={270} y={25} textAnchor="middle" fill="rgba(52,211,153,0.5)" fontSize={10}>
          Cell State (C) — 長期記憶
        </text>

        {/* Hidden state line (bottom) */}
        <line x1={30} y1={220} x2={510} y2={220} stroke="rgba(96,165,250,0.5)" strokeWidth={3} />
        <text x={270} y={250} textAnchor="middle" fill="rgba(96,165,250,0.5)" fontSize={10}>
          Hidden State (h) — 短期記憶 / 輸出
        </text>

        {/* Forget Gate */}
        <g>
          <rect x={80} y={90} width={80} height={50} rx={8} fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.6)" strokeWidth={1.5} />
          <text x={120} y={112} textAnchor="middle" fill="rgba(239,68,68,0.8)" fontSize={10} fontWeight="bold">遺忘門</text>
          <text x={120} y={128} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize={9} fontFamily="monospace">σ(W·[h,x])</text>

          {/* Connection to cell state */}
          <line x1={120} y1={90} x2={120} y2={55} stroke="rgba(239,68,68,0.4)" strokeWidth={1.5} markerEnd="url(#arrowR)" />
          <circle cx={120} cy={55} r={8} fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth={1} />
          <text x={120} y={58} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize={10}>×</text>

          {/* Label */}
          <text x={120} y={160} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize={8}>
            決定丟棄什麼
          </text>
        </g>

        {/* Input Gate */}
        <g>
          <rect x={210} y={90} width={80} height={50} rx={8} fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.6)" strokeWidth={1.5} />
          <text x={250} y={112} textAnchor="middle" fill="rgba(251,191,36,0.8)" fontSize={10} fontWeight="bold">輸入門</text>
          <text x={250} y={128} textAnchor="middle" fill="rgba(251,191,36,0.5)" fontSize={9} fontFamily="monospace">σ × tanh</text>

          {/* Connection to cell state */}
          <line x1={250} y1={90} x2={250} y2={55} stroke="rgba(251,191,36,0.4)" strokeWidth={1.5} markerEnd="url(#arrowY)" />
          <circle cx={250} cy={55} r={8} fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth={1} />
          <text x={250} y={58} textAnchor="middle" fill="rgba(251,191,36,0.5)" fontSize={10}>+</text>

          <text x={250} y={160} textAnchor="middle" fill="rgba(251,191,36,0.5)" fontSize={8}>
            決定記住什麼
          </text>
        </g>

        {/* Output Gate */}
        <g>
          <rect x={350} y={90} width={80} height={50} rx={8} fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.6)" strokeWidth={1.5} />
          <text x={390} y={112} textAnchor="middle" fill="rgba(96,165,250,0.8)" fontSize={10} fontWeight="bold">輸出門</text>
          <text x={390} y={128} textAnchor="middle" fill="rgba(96,165,250,0.5)" fontSize={9} fontFamily="monospace">σ × tanh(C)</text>

          {/* Connection down to hidden state */}
          <line x1={390} y1={140} x2={390} y2={205} stroke="rgba(96,165,250,0.4)" strokeWidth={1.5} markerEnd="url(#arrowB3)" />

          <text x={390} y={160} textAnchor="middle" fill="rgba(96,165,250,0.5)" fontSize={8}>
            決定輸出什麼
          </text>
        </g>

        {/* Input arrows from bottom */}
        <g>
          <line x1={60} y1={220} x2={60} y2={175} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          <line x1={60} y1={175} x2={115} y2={140} stroke="rgba(255,255,255,0.2)" strokeWidth={1} markerEnd="url(#arrowW)" />
          <line x1={60} y1={175} x2={245} y2={140} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={60} y1={175} x2={385} y2={140} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={40} y={195} fill="rgba(255,255,255,0.3)" fontSize={9}>h(t-1)</text>
        </g>

        <g>
          <text x={480} y={195} fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace">x(t)</text>
          <line x1={480} y1={200} x2={480} y2={175} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          <line x1={480} y1={175} x2={160} y2={140} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <line x1={480} y1={175} x2={290} y2={140} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <line x1={480} y1={175} x2={430} y2={140} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        </g>

        {/* Flow direction */}
        <text x={w / 2} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={9}>
          三個門控機制讓 LSTM 能選擇性地記住、遺忘和輸出資訊，解決長期依賴問題
        </text>

        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(239,68,68,0.5)" />
          </marker>
          <marker id="arrowY" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(251,191,36,0.5)" />
          </marker>
          <marker id="arrowB3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(96,165,250,0.5)" />
          </marker>
          <marker id="arrowW" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── 16. Softmax classification ───
function SoftmaxDiagram({ caption }: DiagramProps) {
  const w = 520;
  const h = 220;

  const logits = [2.0, 1.0, 0.1];
  const labels = ["貓", "狗", "鳥"];
  const colors = ["rgba(251,191,36,0.8)", "rgba(96,165,250,0.8)", "rgba(52,211,153,0.8)"];
  const fills = ["rgba(251,191,36,0.15)", "rgba(96,165,250,0.15)", "rgba(52,211,153,0.15)"];

  // Compute softmax
  const maxL = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxL));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sumExp);

  const barMaxH = 120;

  return (
    <DiagramWrapper caption={caption}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 240 }}>
        {/* Logits */}
        <text x={70} y={20} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>原始分數 (Logits)</text>
        {logits.map((l, i) => (
          <g key={`l${i}`}>
            <rect x={30} y={35 + i * 45} width={80} height={32} rx={6} fill={fills[i]} stroke={colors[i]} strokeWidth={1.5} />
            <text x={70} y={55 + i * 45} textAnchor="middle" fill={colors[i]} fontSize={14} fontFamily="monospace" fontWeight="bold">
              {l.toFixed(1)}
            </text>
            <text x={10} y={55 + i * 45} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
              {labels[i]}
            </text>
          </g>
        ))}

        {/* Arrow */}
        <g>
          <line x1={130} y1={90} x2={190} y2={90} stroke="rgba(255,255,255,0.3)" strokeWidth={2} markerEnd="url(#arrowW2)" />
          <text x={160} y={75} textAnchor="middle" fill="rgba(139,92,246,0.7)" fontSize={10} fontWeight="bold">
            Softmax
          </text>
          <text x={160} y={110} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="monospace">
            eˣⁱ / Σeˣ
          </text>
        </g>

        {/* Probability bars */}
        <text x={300} y={20} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>機率分佈</text>
        {probs.map((p, i) => {
          const barW = p * 180;
          return (
            <g key={`p${i}`}>
              <rect x={210} y={35 + i * 45} width={barW} height={32} rx={6} fill={fills[i]} stroke={colors[i]} strokeWidth={1.5} />
              <text x={215 + barW + 5} y={55 + i * 45} textAnchor="start" fill={colors[i]} fontSize={12} fontFamily="monospace" fontWeight="bold">
                {(p * 100).toFixed(1)}%
              </text>
              <text x={215} y={55 + i * 45} fill={colors[i]} fontSize={11}>
                {labels[i]}
              </text>
            </g>
          );
        })}

        {/* Sum = 1 annotation */}
        <text x={300} y={185} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace">
          {probs.map((p) => (p * 100).toFixed(1) + "%").join(" + ")} = 100%
        </text>

        {/* Result */}
        <g>
          <line x1={395} y1={90} x2={440} y2={90} stroke="rgba(255,255,255,0.3)" strokeWidth={2} markerEnd="url(#arrowW2)" />
          <rect x={445} y={65} width={60} height={50} rx={10} fill="rgba(251,191,36,0.2)" stroke="rgba(251,191,36,0.7)" strokeWidth={2} />
          <text x={475} y={87} textAnchor="middle" fill="rgba(251,191,36,0.9)" fontSize={18}>
            {labels[0]}
          </text>
          <text x={475} y={104} textAnchor="middle" fill="rgba(251,191,36,0.6)" fontSize={9}>
            預測結果
          </text>
        </g>

        <text x={w / 2} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={9}>
          Softmax 將任意實數轉為機率分佈（總和 = 1），最大機率的類別即為預測結果
        </text>

        <defs>
          <marker id="arrowW2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.4)" />
          </marker>
        </defs>
      </svg>
    </DiagramWrapper>
  );
}

// ─── Diagram registry ───
const DIAGRAMS: Record<string, React.FC<DiagramProps>> = {
  "single-neuron": SingleNeuron,
  "multi-layer-network": MultiLayerNetwork,
  "activation-functions": ActivationFunctions,
  "gradient-descent": GradientDescentDiagram,
  "backprop-flow": BackpropFlow,
  "cnn-architecture": CNNArchitecture,
  "overfitting": OverfittingDiagram,
  "rnn-unrolled": RNNUnrolled,
  "perceptron-boundary": PerceptronBoundary,
  "loss-functions": LossFunctions,
  "dropout": DropoutDiagram,
  "optimizer-paths": OptimizerPaths,
  "convolution-step": ConvolutionStep,
  "max-pooling": MaxPoolingDiagram,
  "lstm-gates": LSTMGates,
  "softmax": SoftmaxDiagram,
};

export function getDiagramComponent(name: string): React.FC<DiagramProps> | null {
  return DIAGRAMS[name] || null;
}

export function DiagramSection({ diagram, caption }: { diagram: string; caption?: string }) {
  const Component = getDiagramComponent(diagram);
  if (!Component) {
    return (
      <div className="my-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center text-[var(--foreground)]/40 text-sm">
        圖表 &quot;{diagram}&quot; 不存在
      </div>
    );
  }
  return <Component caption={caption} />;
}
