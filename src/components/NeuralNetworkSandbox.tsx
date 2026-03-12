"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// --- Types ---
interface Neuron {
  x: number;
  y: number;
  value: number;
  rawValue: number;
  layerIndex: number;
  neuronIndex: number;
}

interface Connection {
  from: Neuron;
  to: Neuron;
  weight: number;
  signal: number;
}

interface SignalParticle {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  value: number;
}

type ActivationFn = "relu" | "sigmoid" | "tanh";

function activate(x: number, fn: ActivationFn): number {
  switch (fn) {
    case "relu": return Math.max(0, x);
    case "sigmoid": return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
    case "tanh": return Math.tanh(x);
  }
}

// --- Main Component ---
export function NeuralNetworkSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<SignalParticle[]>([]);

  // View transform (pan & zoom)
  const viewRef = useRef({ offsetX: 0, offsetY: 0, zoom: 1 });
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  const [viewState, setViewState] = useState({ offsetX: 0, offsetY: 0, zoom: 1 });

  const [layerConfig, setLayerConfig] = useState<number[]>([2, 4, 3, 1]);
  const [activationFn, setActivationFn] = useState<ActivationFn>("relu");
  const [outputActivation, setOutputActivation] = useState<ActivationFn>("sigmoid");
  const [inputs, setInputs] = useState<number[]>([1.0, 0.5]);
  const [weights, setWeights] = useState<number[][][]>([]);
  const [biases, setBiases] = useState<number[][]>([]);
  const [neurons, setNeurons] = useState<Neuron[][]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [hoveredNeuron, setHoveredNeuron] = useState<{ layer: number; index: number } | null>(null);

  const initializeWeights = useCallback((layers: number[]) => {
    const w: number[][][] = [];
    const b: number[][] = [];
    for (let l = 0; l < layers.length - 1; l++) {
      const scale = Math.sqrt(2 / (layers[l] + layers[l + 1]));
      w.push(
        Array.from({ length: layers[l + 1] }, () =>
          Array.from({ length: layers[l] }, () => parseFloat(((Math.random() * 2 - 1) * scale).toFixed(3)))
        )
      );
      b.push(Array.from({ length: layers[l + 1] }, () => 0));
    }
    setWeights(w);
    setBiases(b);
  }, []);

  // Compute neuron positions in a fixed "world" coordinate space
  // The network is laid out in a world space of worldW x worldH,
  // then the view transform maps it to screen.
  const computeForward = useCallback(() => {
    if (weights.length === 0) return;

    const PADDING = 60;
    const NEURON_SPACING_Y = 80;
    const LAYER_SPACING_X = 160;

    const maxNeurons = Math.max(...layerConfig);
    const numLayers = layerConfig.length;
    const worldW = (numLayers + 1) * LAYER_SPACING_X;
    const worldH = (maxNeurons + 1) * NEURON_SPACING_Y;

    const allNeurons: Neuron[][] = [];
    const allConnections: Connection[] = [];

    // Input neurons
    const inputNeurons: Neuron[] = inputs.map((val, i) => {
      const layerH = (inputs.length - 1) * NEURON_SPACING_Y;
      const startY = (worldH - layerH) / 2;
      return {
        x: LAYER_SPACING_X,
        y: startY + i * NEURON_SPACING_Y,
        value: val,
        rawValue: val,
        layerIndex: 0,
        neuronIndex: i,
      };
    });
    allNeurons.push(inputNeurons);

    let currentValues = [...inputs];

    for (let l = 0; l < weights.length; l++) {
      const layerSize = layerConfig[l + 1];
      const layerH = (layerSize - 1) * NEURON_SPACING_Y;
      const startY = (worldH - layerH) / 2;
      const x = LAYER_SPACING_X * (l + 2);
      const isLast = l === weights.length - 1;
      const actFn = isLast ? outputActivation : activationFn;

      const layerNeurons: Neuron[] = [];
      const newValues: number[] = [];

      for (let j = 0; j < layerSize; j++) {
        const ny = startY + j * NEURON_SPACING_Y;
        let sum = biases[l]?.[j] ?? 0;
        for (let i = 0; i < currentValues.length; i++) {
          const w = weights[l]?.[j]?.[i] ?? 0;
          const signal = currentValues[i] * w;
          allConnections.push({
            from: allNeurons[l][i],
            to: { x, y: ny, value: 0, rawValue: 0, layerIndex: l + 1, neuronIndex: j },
            weight: w,
            signal,
          });
          sum += signal;
        }

        const activated = activate(sum, actFn);
        const neuron: Neuron = {
          x,
          y: ny,
          value: activated,
          rawValue: sum,
          layerIndex: l + 1,
          neuronIndex: j,
        };
        layerNeurons.push(neuron);
        newValues.push(activated);
      }

      allNeurons.push(layerNeurons);
      currentValues = newValues;

      // Fix connection "to" references
      const connStart = allConnections.length - layerSize * allNeurons[l].length;
      for (let ci = connStart; ci < allConnections.length; ci++) {
        if (ci >= 0) {
          const conn = allConnections[ci];
          const targetNeuron = layerNeurons.find(n => n.neuronIndex === conn.to.neuronIndex);
          if (targetNeuron) conn.to = targetNeuron;
        }
      }
    }

    setNeurons(allNeurons);
    setConnections(allConnections);
  }, [inputs, weights, biases, layerConfig, activationFn, outputActivation]);

  // Fit the view so the entire network is visible
  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || neurons.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    // Find bounding box of all neurons
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const layer of neurons) {
      for (const n of layer) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
      }
    }

    const PAD = 50;
    minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD;
    const netW = maxX - minX;
    const netH = maxY - minY;

    const zoom = Math.min(cw / netW, ch / netH, 2);
    const offsetX = (cw - netW * zoom) / 2 - minX * zoom;
    const offsetY = (ch - netH * zoom) / 2 - minY * zoom;

    viewRef.current = { offsetX, offsetY, zoom };
    setViewState({ offsetX, offsetY, zoom });
  }, [neurons]);

  // Init
  useEffect(() => {
    setInputs(Array.from({ length: layerConfig[0] }, () => parseFloat((Math.random() * 2 - 1).toFixed(2))));
    initializeWeights(layerConfig);
  }, [layerConfig, initializeWeights]);

  useEffect(() => {
    computeForward();
  }, [computeForward]);

  // Auto-fit after neurons are computed
  useEffect(() => {
    if (neurons.length > 0) fitToView();
  }, [neurons, fitToView]);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    particlesRef.current = [];
    connections.forEach((conn) => {
      const layerDelay = conn.from.layerIndex * 0.3;
      particlesRef.current.push({
        fromX: conn.from.x,
        fromY: conn.from.y,
        toX: conn.to.x,
        toY: conn.to.y,
        progress: -layerDelay,
        value: conn.signal,
      });
    });
  }, [connections]);

  // --- Canvas rendering with pan/zoom ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizeObserver: ResizeObserver | null = null;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();

    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      ctx.clearRect(0, 0, cw, ch);

      const { offsetX, offsetY, zoom } = viewRef.current;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);

      // Draw connections
      connections.forEach((conn) => {
        const absWeight = Math.abs(conn.weight);
        const opacity = Math.min(0.8, absWeight * 0.8 + 0.1);
        const isPositive = conn.weight >= 0;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.strokeStyle = isPositive
          ? `rgba(99, 102, 241, ${opacity})`
          : `rgba(244, 114, 182, ${opacity})`;
        ctx.lineWidth = Math.max(0.5, absWeight * 2.5) / zoom;
        ctx.stroke();
      });

      // Signal particles
      if (isAnimating) {
        let anyActive = false;
        particlesRef.current.forEach((p) => {
          p.progress += 0.015 * animationSpeed;
          if (p.progress >= 0 && p.progress <= 1) {
            anyActive = true;
            const x = p.fromX + (p.toX - p.fromX) * p.progress;
            const y = p.fromY + (p.toY - p.fromY) * p.progress;
            const absVal = Math.min(1, Math.abs(p.value));
            const radius = (3 + absVal * 4) / zoom;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = p.value >= 0
              ? `rgba(34, 211, 238, ${0.6 + absVal * 0.4})`
              : `rgba(244, 114, 182, ${0.6 + absVal * 0.4})`;
            ctx.fill();
            // Glow
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = p.value >= 0
              ? `rgba(34, 211, 238, ${0.15 + absVal * 0.1})`
              : `rgba(244, 114, 182, ${0.15 + absVal * 0.1})`;
            ctx.fill();
          } else if (p.progress < 1) {
            anyActive = true;
          }
        });
        if (!anyActive) {
          setIsAnimating(false);
          particlesRef.current = [];
        }
      }

      // Draw neurons
      neurons.forEach((layer) => {
        layer.forEach((neuron) => {
          const isHovered =
            hoveredNeuron?.layer === neuron.layerIndex &&
            hoveredNeuron?.index === neuron.neuronIndex;
          const absVal = Math.min(1, Math.abs(neuron.value));
          const radius = isHovered ? 22 : 18;

          // Glow
          if (absVal > 0.1) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${absVal * 0.15})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, radius);
          if (neuron.value > 0) {
            gradient.addColorStop(0, `rgba(99, 102, 241, ${0.3 + absVal * 0.7})`);
            gradient.addColorStop(1, `rgba(99, 102, 241, ${0.1 + absVal * 0.3})`);
          } else {
            gradient.addColorStop(0, `rgba(244, 114, 182, ${0.3 + absVal * 0.5})`);
            gradient.addColorStop(1, `rgba(58, 58, 92, 0.8)`);
          }
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = isHovered ? "rgba(129, 140, 248, 0.8)" : "rgba(99, 102, 241, 0.4)";
          ctx.lineWidth = (isHovered ? 2 : 1) / zoom;
          ctx.stroke();

          // Value text
          ctx.fillStyle = "rgba(224, 224, 232, 0.9)";
          ctx.font = `${11 / zoom}px monospace`;
          // Keep text readable: use a minimum font size
          const fontSize = Math.max(10, Math.min(14, 11 / zoom));
          ctx.font = `${fontSize}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y);
        });
      });

      // Layer labels
      const layerLabels = layerConfig.map((_, i) => {
        if (i === 0) return "輸入層";
        if (i === layerConfig.length - 1) return "輸出層";
        return `隱藏層 ${i}`;
      });
      neurons.forEach((layer, i) => {
        if (layer.length > 0) {
          // Position label above the topmost neuron
          const topY = Math.min(...layer.map(n => n.y));
          ctx.fillStyle = "rgba(224, 224, 232, 0.5)";
          const labelFontSize = Math.max(10, Math.min(14, 12 / zoom));
          ctx.font = `${labelFontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(layerLabels[i], layer[0].x, topY - 30);
        }
      });

      ctx.restore();

      // Draw zoom indicator (in screen space)
      ctx.fillStyle = "rgba(224, 224, 232, 0.3)";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(zoom * 100)}%`, cw - 12, ch - 12);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [neurons, connections, isAnimating, animationSpeed, hoveredNeuron, layerConfig]);

  // --- Mouse event handlers for pan, zoom, hover ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { offsetX, offsetY, zoom } = viewRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.min(5, Math.max(0.1, zoom * zoomFactor));

      // Zoom towards mouse position
      const newOffsetX = mouseX - (mouseX - offsetX) * (newZoom / zoom);
      const newOffsetY = mouseY - (mouseY - offsetY) * (newZoom / zoom);

      viewRef.current = { offsetX: newOffsetX, offsetY: newOffsetY, zoom: newZoom };
      setViewState({ offsetX: newOffsetX, offsetY: newOffsetY, zoom: newZoom });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Middle button or left button
      dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        viewRef.current.offsetX += dx;
        viewRef.current.offsetY += dy;
        setViewState({ ...viewRef.current });
        return;
      }

      // Hover detection: convert screen coords to world coords
      const { offsetX, offsetY, zoom } = viewRef.current;
      const worldX = (mouseX - offsetX) / zoom;
      const worldY = (mouseY - offsetY) / zoom;

      let found = false;
      for (const layer of neurons) {
        for (const neuron of layer) {
          const dx = worldX - neuron.x;
          const dy = worldY - neuron.y;
          if (Math.sqrt(dx * dx + dy * dy) < 24) {
            setHoveredNeuron({ layer: neuron.layerIndex, index: neuron.neuronIndex });
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) setHoveredNeuron(null);

      if (!dragRef.current.isDragging) {
        canvas.style.cursor = found ? "pointer" : "grab";
      }
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      canvas.style.cursor = "grab";
    };

    const handleMouseLeave = () => {
      dragRef.current.isDragging = false;
      canvas.style.cursor = "grab";
      setHoveredNeuron(null);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Touch support for mobile
    let lastTouchDist = 0;
    let lastTouchCenter = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current = { isDragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        lastTouchCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current.isDragging) {
        const dx = e.touches[0].clientX - dragRef.current.lastX;
        const dy = e.touches[0].clientY - dragRef.current.lastY;
        dragRef.current.lastX = e.touches[0].clientX;
        dragRef.current.lastY = e.touches[0].clientY;
        viewRef.current.offsetX += dx;
        viewRef.current.offsetY += dy;
        setViewState({ ...viewRef.current });
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const center = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };

        if (lastTouchDist > 0) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = center.x - rect.left;
          const mouseY = center.y - rect.top;
          const { offsetX, offsetY, zoom } = viewRef.current;
          const scaleFactor = dist / lastTouchDist;
          const newZoom = Math.min(5, Math.max(0.1, zoom * scaleFactor));
          viewRef.current = {
            offsetX: mouseX - (mouseX - offsetX) * (newZoom / zoom),
            offsetY: mouseY - (mouseY - offsetY) * (newZoom / zoom),
            zoom: newZoom,
          };
          setViewState({ ...viewRef.current });
        }
        lastTouchDist = dist;
        lastTouchCenter = center;
      }
    };

    const handleTouchEnd = () => {
      dragRef.current.isDragging = false;
      lastTouchDist = 0;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [neurons]);

  const addLayer = () => {
    if (layerConfig.length >= 6) return;
    const newConfig = [...layerConfig];
    newConfig.splice(newConfig.length - 1, 0, 3);
    setLayerConfig(newConfig);
  };

  const removeLayer = () => {
    if (layerConfig.length <= 2) return;
    const newConfig = [...layerConfig];
    newConfig.splice(newConfig.length - 2, 1);
    setLayerConfig(newConfig);
  };

  const updateLayerSize = (layerIndex: number, size: number) => {
    const clamped = Math.max(1, Math.min(8, size));
    const newConfig = [...layerConfig];
    newConfig[layerIndex] = clamped;
    setLayerConfig(newConfig);
  };

  const randomizeWeights = () => {
    initializeWeights(layerConfig);
  };

  const updateInput = (index: number, value: number) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Canvas */}
      <div ref={containerRef} className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: "560px", cursor: "grab" }}
        />
        {/* Overlay controls */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={fitToView}
            className="px-2 py-1 text-xs rounded-md bg-[var(--surface-light)]/80 backdrop-blur text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
            title="適應畫面"
          >
            適應畫面
          </button>
          <button
            onClick={() => {
              const { offsetX, offsetY, zoom } = viewRef.current;
              const newZoom = Math.min(5, zoom * 1.3);
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              viewRef.current = {
                offsetX: cx - (cx - offsetX) * (newZoom / zoom),
                offsetY: cy - (cy - offsetY) * (newZoom / zoom),
                zoom: newZoom,
              };
              setViewState({ ...viewRef.current });
            }}
            className="px-2 py-1 text-xs rounded-md bg-[var(--surface-light)]/80 backdrop-blur text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
            title="放大"
          >
            +
          </button>
          <button
            onClick={() => {
              const { offsetX, offsetY, zoom } = viewRef.current;
              const newZoom = Math.max(0.1, zoom / 1.3);
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              viewRef.current = {
                offsetX: cx - (cx - offsetX) * (newZoom / zoom),
                offsetY: cy - (cy - offsetY) * (newZoom / zoom),
                zoom: newZoom,
              };
              setViewState({ ...viewRef.current });
            }}
            className="px-2 py-1 text-xs rounded-md bg-[var(--surface-light)]/80 backdrop-blur text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
            title="縮小"
          >
            -
          </button>
        </div>
        {/* Hint */}
        <div className="absolute bottom-3 left-3 text-[10px] text-[var(--foreground)]/30 pointer-events-none">
          拖曳移動 · 滾輪縮放
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-4">
        {/* Network Architecture */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-sm">網路架構</h3>
          <div className="space-y-2">
            {layerConfig.map((size, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-[var(--foreground)]/50 w-16">
                  {i === 0 ? "輸入層" : i === layerConfig.length - 1 ? "輸出層" : `隱藏 ${i}`}
                </span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={size}
                  onChange={(e) => updateLayerSize(i, parseInt(e.target.value))}
                  className="flex-1 accent-[var(--primary)]"
                />
                <span className="text-xs font-mono w-6 text-center">{size}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={addLayer}
              disabled={layerConfig.length >= 6}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/20 text-[var(--primary-light)] hover:bg-[var(--primary)]/30 disabled:opacity-30 transition-colors"
            >
              + 加一層
            </button>
            <button
              onClick={removeLayer}
              disabled={layerConfig.length <= 2}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30 disabled:opacity-30 transition-colors"
            >
              - 減一層
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-sm">輸入值</h3>
          <div className="space-y-2">
            {inputs.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-[var(--foreground)]/50 w-8">x{i + 1}</span>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={val}
                  onChange={(e) => updateInput(i, parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--secondary)]"
                />
                <span className="text-xs font-mono w-10 text-right">{val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activation Functions */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-sm">激活函數</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-[var(--foreground)]/50">隱藏層</label>
              <div className="flex gap-1 mt-1">
                {(["relu", "sigmoid", "tanh"] as ActivationFn[]).map((fn) => (
                  <button
                    key={fn}
                    onClick={() => setActivationFn(fn)}
                    className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-mono transition-colors ${
                      activationFn === fn
                        ? "bg-[var(--primary)]/30 text-[var(--primary-light)]"
                        : "bg-[var(--surface-light)] text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                    }`}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--foreground)]/50">輸出層</label>
              <div className="flex gap-1 mt-1">
                {(["relu", "sigmoid", "tanh"] as ActivationFn[]).map((fn) => (
                  <button
                    key={fn}
                    onClick={() => setOutputActivation(fn)}
                    className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-mono transition-colors ${
                      outputActivation === fn
                        ? "bg-[var(--primary)]/30 text-[var(--primary-light)]"
                        : "bg-[var(--surface-light)] text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                    }`}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-sm">操作</h3>
          <div className="space-y-2">
            <button
              onClick={triggerAnimation}
              disabled={isAnimating}
              className="w-full text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isAnimating ? "訊號傳遞中..." : "▶ 傳遞訊號"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground)]/50">速度</span>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.2}
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="text-xs font-mono w-8">{animationSpeed.toFixed(1)}x</span>
            </div>
            <button
              onClick={randomizeWeights}
              className="w-full text-sm px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-light)] transition-colors"
            >
              隨機初始化權重
            </button>
          </div>
        </div>

        {/* Info Panel */}
        {hoveredNeuron && neurons[hoveredNeuron.layer] && (
          <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30">
            <h3 className="font-semibold mb-2 text-sm text-[var(--primary-light)]">
              神經元資訊
            </h3>
            <div className="space-y-1 text-xs font-mono">
              <div>
                層：{hoveredNeuron.layer === 0 ? "輸入層" : hoveredNeuron.layer === layerConfig.length - 1 ? "輸出層" : `隱藏層 ${hoveredNeuron.layer}`}
              </div>
              <div>索引：{hoveredNeuron.index}</div>
              <div>
                原始值：{neurons[hoveredNeuron.layer]?.[hoveredNeuron.index]?.rawValue.toFixed(4)}
              </div>
              <div>
                激活後：{neurons[hoveredNeuron.layer]?.[hoveredNeuron.index]?.value.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-sm">圖例</h3>
          <div className="space-y-2 text-xs text-[var(--foreground)]/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[var(--primary)]" />
              <span>正權重連接</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[var(--accent)]" />
              <span>負權重連接</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--secondary)]" />
              <span>正值訊號粒子</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
              <span>負值訊號粒子</span>
            </div>
            <p className="mt-2 leading-relaxed">
              拖曳畫面移動，滾輪縮放。連線粗細代表權重大小，神經元亮度代表激活值強度。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
