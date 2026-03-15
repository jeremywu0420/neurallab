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
  targetLayer: number;
  targetIndex: number;
}

type ActivationFn = "relu" | "sigmoid" | "tanh";

function activate(x: number, fn: ActivationFn): number {
  switch (fn) {
    case "relu": return Math.max(0, x);
    case "sigmoid": return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
    case "tanh": return Math.tanh(x);
  }
}

function getLayerLabel(layerIndex: number, totalLayers: number): string {
  if (layerIndex === 0) return "IN";
  if (layerIndex === totalLayers - 1) return "OUT";
  return `H${layerIndex}`;
}

// --- Main Component ---
export function NeuralNetworkSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<SignalParticle[]>([]);

  // View transform (pan & zoom)
  const viewRef = useRef({ offsetX: 0, offsetY: 0, zoom: 1 });
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0, hasMoved: false });
  const [viewState, setViewState] = useState({ offsetX: 0, offsetY: 0, zoom: 1 });

  const [layerConfig, setLayerConfig] = useState<number[]>([3, 4, 3, 2]);
  const [activationFn, setActivationFn] = useState<ActivationFn>("sigmoid");
  const [outputActivation, setOutputActivation] = useState<ActivationFn>("sigmoid");
  const [inputs, setInputs] = useState<number[]>([0.8, -0.5, 0.3]);
  const [weights, setWeights] = useState<number[][][]>([]);
  const [biases, setBiases] = useState<number[][]>([]);
  const [neurons, setNeurons] = useState<Neuron[][]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const hoveredNeuronRef = useRef<{ layer: number; index: number } | null>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<{ layer: number; index: number } | null>(null);

  // Track which neurons have been "lit" during propagation
  const [litNeurons, setLitNeurons] = useState<Set<string>>(new Set());
  const litNeuronsRef = useRef<Set<string>>(new Set());
  const [propagationActive, setPropagationActive] = useState(false);

  const neuronKey = (layer: number, index: number) => `${layer}-${index}`;

  const initializeWeights = useCallback((layers: number[]) => {
    const w: number[][][] = [];
    const b: number[][] = [];
    for (let l = 0; l < layers.length - 1; l++) {
      const scale = Math.sqrt(2 / (layers[l] + layers[l + 1]));
      w.push(
        Array.from({ length: layers[l + 1] }, () =>
          Array.from({ length: layers[l] }, () => parseFloat(((Math.random() * 2 - 1) * scale).toFixed(2)))
        )
      );
      b.push(Array.from({ length: layers[l + 1] }, () => parseFloat(((Math.random() * 0.6 - 0.3)).toFixed(2))));
    }
    setWeights(w);
    setBiases(b);
  }, []);

  const computeForward = useCallback(() => {
    if (weights.length === 0) return;

    const NEURON_SPACING_Y = 80;
    const LAYER_SPACING_X = 160;

    const maxNeurons = Math.max(...layerConfig);
    const worldH = (maxNeurons + 1) * NEURON_SPACING_Y;

    const allNeurons: Neuron[][] = [];
    const allConnections: Connection[] = [];

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

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || neurons.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const layer of neurons) {
      for (const n of layer) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
      }
    }

    const PAD = 60;
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
    setInputs(Array.from({ length: layerConfig[0] }, () => parseFloat((Math.random() * 1.6 - 0.8).toFixed(2))));
    initializeWeights(layerConfig);
  }, [layerConfig, initializeWeights]);

  useEffect(() => {
    computeForward();
  }, [computeForward]);

  useEffect(() => {
    if (neurons.length > 0) fitToView();
  }, [neurons, fitToView]);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setPropagationActive(true);
    // Start with only input neurons lit
    const initialLit = new Set<string>();
    if (neurons[0]) {
      neurons[0].forEach((n) => initialLit.add(neuronKey(n.layerIndex, n.neuronIndex)));
    }
    litNeuronsRef.current = initialLit;
    setLitNeurons(new Set(initialLit));

    particlesRef.current = [];
    connections.forEach((conn) => {
      const layerDelay = conn.from.layerIndex * 0.35;
      particlesRef.current.push({
        fromX: conn.from.x,
        fromY: conn.from.y,
        toX: conn.to.x,
        toY: conn.to.y,
        progress: -layerDelay,
        value: conn.signal,
        targetLayer: conn.to.layerIndex,
        targetIndex: conn.to.neuronIndex,
      });
    });
  }, [connections, neurons]);

  // --- Canvas rendering ---
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
      const isPropagating = propagationActive;
      const currentLit = litNeuronsRef.current;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);

      // Helper: is a neuron lit?
      const isLit = (layer: number, index: number) => {
        if (!isPropagating) return true;
        return currentLit.has(neuronKey(layer, index));
      };

      // Draw connections
      connections.forEach((conn) => {
        const absWeight = Math.abs(conn.weight);
        const isPositive = conn.weight >= 0;

        // During propagation, dim connections to unlit targets
        const fromLit = isLit(conn.from.layerIndex, conn.from.neuronIndex);
        const toLit = isLit(conn.to.layerIndex, conn.to.neuronIndex);
        const connLit = fromLit && toLit;
        const isSelected = selectedNeuron && (
          (conn.to.layerIndex === selectedNeuron.layer && conn.to.neuronIndex === selectedNeuron.index) ||
          (conn.from.layerIndex === selectedNeuron.layer && conn.from.neuronIndex === selectedNeuron.index)
        );

        let opacity: number;
        if (isSelected) {
          // Highlight connections to/from selected neuron
          opacity = Math.min(0.95, absWeight * 0.8 + 0.3);
        } else if (isPropagating && !connLit) {
          opacity = 0.05;
        } else {
          opacity = Math.min(0.8, absWeight * 0.8 + 0.1);
        }

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);

        if (isSelected) {
          ctx.strokeStyle = isPositive
            ? `rgba(34, 211, 238, ${opacity})`
            : `rgba(244, 114, 182, ${opacity})`;
          ctx.lineWidth = Math.max(1, absWeight * 3.5) / zoom;
        } else {
          ctx.strokeStyle = isPositive
            ? `rgba(99, 102, 241, ${opacity})`
            : `rgba(244, 114, 182, ${opacity})`;
          ctx.lineWidth = Math.max(0.5, absWeight * 2.5) / zoom;
        }
        ctx.stroke();

        // Draw weight dots on connections to selected neuron
        if (isSelected && conn.to.layerIndex === selectedNeuron.layer && conn.to.neuronIndex === selectedNeuron.index) {
          const dotX = conn.to.x - 24 / zoom;
          const dotY = conn.to.y + (conn.from.neuronIndex - (neurons[conn.from.layerIndex]?.length ?? 1) / 2) * 4;
          const dotRadius = 3 / zoom;
          ctx.beginPath();
          ctx.arc(conn.from.x + (conn.to.x - conn.from.x) * 0.85, conn.from.y + (conn.to.y - conn.from.y) * 0.85, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = isPositive ? "rgba(34, 211, 238, 0.9)" : "rgba(244, 114, 182, 0.9)";
          ctx.fill();
        }
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
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = p.value >= 0
              ? `rgba(34, 211, 238, ${0.15 + absVal * 0.1})`
              : `rgba(244, 114, 182, ${0.15 + absVal * 0.1})`;
            ctx.fill();
          } else if (p.progress < 1) {
            anyActive = true;
          }

          // Light up target neuron when particle arrives
          if (p.progress >= 1) {
            const key = neuronKey(p.targetLayer, p.targetIndex);
            if (!currentLit.has(key)) {
              currentLit.add(key);
              setLitNeurons(new Set(currentLit));
            }
          }
        });
        if (!anyActive) {
          setIsAnimating(false);
          particlesRef.current = [];
          // After animation ends, keep all lit briefly then reset
          setTimeout(() => {
            setPropagationActive(false);
            litNeuronsRef.current = new Set();
            setLitNeurons(new Set());
          }, 800);
        }
      }

      // Draw neurons
      neurons.forEach((layer) => {
        layer.forEach((neuron) => {
          const isHovered =
            hoveredNeuronRef.current?.layer === neuron.layerIndex &&
            hoveredNeuronRef.current?.index === neuron.neuronIndex;
          const isSel =
            selectedNeuron?.layer === neuron.layerIndex &&
            selectedNeuron?.index === neuron.neuronIndex;
          const neuronLit = isLit(neuron.layerIndex, neuron.neuronIndex);
          const absVal = Math.min(1, Math.abs(neuron.value));
          const radius = isSel ? 24 : isHovered ? 22 : 18;

          // Dimming for unlit neurons during propagation
          const dimFactor = neuronLit ? 1 : 0.15;

          // Glow for lit neurons
          if (absVal > 0.1 && neuronLit) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = isSel
              ? `rgba(251, 191, 36, ${absVal * 0.2})`
              : `rgba(34, 211, 238, ${absVal * 0.15})`;
            ctx.fill();
          }

          // Selected neuron: dashed orange border
          if (isSel) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 5, 0, Math.PI * 2);
            ctx.setLineDash([4 / zoom, 3 / zoom]);
            ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Main neuron circle
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, radius);

          if (!neuronLit) {
            // Dim/grey for unlit
            gradient.addColorStop(0, "rgba(80, 80, 100, 0.4)");
            gradient.addColorStop(1, "rgba(50, 50, 70, 0.3)");
          } else if (neuron.value >= 0) {
            gradient.addColorStop(0, `rgba(34, 211, 238, ${(0.3 + absVal * 0.5) * dimFactor})`);
            gradient.addColorStop(1, `rgba(34, 211, 238, ${(0.1 + absVal * 0.2) * dimFactor})`);
          } else {
            gradient.addColorStop(0, `rgba(244, 114, 182, ${(0.3 + absVal * 0.5) * dimFactor})`);
            gradient.addColorStop(1, `rgba(58, 58, 92, ${0.8 * dimFactor})`);
          }
          ctx.fillStyle = gradient;
          ctx.fill();

          // Border
          if (isSel) {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
            ctx.lineWidth = 2.5 / zoom;
          } else if (isHovered) {
            ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
            ctx.lineWidth = 2 / zoom;
          } else if (neuronLit) {
            ctx.strokeStyle = neuron.value >= 0
              ? "rgba(34, 211, 238, 0.5)"
              : "rgba(244, 114, 182, 0.5)";
            ctx.lineWidth = 1.5 / zoom;
          } else {
            ctx.strokeStyle = "rgba(100, 100, 130, 0.3)";
            ctx.lineWidth = 1 / zoom;
          }
          ctx.stroke();

          // Neuron label (e.g., h1.1) above
          const label = `${getLayerLabel(neuron.layerIndex, layerConfig.length).toLowerCase()}${neuron.layerIndex > 0 && neuron.layerIndex < layerConfig.length - 1 ? `.${neuron.neuronIndex + 1}` : ''}`;
          if (neuron.layerIndex > 0 && neuron.layerIndex < layerConfig.length - 1) {
            const labelFontSize = Math.max(8, Math.min(10, 9));
            ctx.fillStyle = neuronLit ? "rgba(34, 211, 238, 0.6)" : "rgba(100, 100, 130, 0.3)";
            ctx.font = `${labelFontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`h${neuron.layerIndex}.${neuron.neuronIndex + 1}`, neuron.x, neuron.y - radius - 4);
          } else if (neuron.layerIndex === 0) {
            const labelFontSize = Math.max(8, Math.min(10, 9));
            ctx.fillStyle = neuronLit ? "rgba(34, 211, 238, 0.6)" : "rgba(100, 100, 130, 0.3)";
            ctx.font = `${labelFontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`x${neuron.neuronIndex + 1}`, neuron.x, neuron.y - radius - 4);
          } else {
            const labelFontSize = Math.max(8, Math.min(10, 9));
            ctx.fillStyle = neuronLit ? "rgba(34, 211, 238, 0.6)" : "rgba(100, 100, 130, 0.3)";
            ctx.font = `${labelFontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`y${neuron.neuronIndex + 1}`, neuron.x, neuron.y - radius - 4);
          }

          // Value text
          const fontSize = Math.max(10, Math.min(13, 12));
          ctx.fillStyle = neuronLit ? "rgba(255, 255, 255, 0.95)" : "rgba(100, 100, 130, 0.4)";
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y);
        });
      });

      // Layer labels at top
      const layerLabels = layerConfig.map((_, i) => {
        if (i === 0) return "輸入層";
        if (i === layerConfig.length - 1) return "輸出層";
        return `隱藏層 ${i}`;
      });
      neurons.forEach((layer, i) => {
        if (layer.length > 0) {
          const topY = Math.min(...layer.map(n => n.y));
          ctx.fillStyle = "rgba(224, 224, 232, 0.4)";
          const labelFontSize = Math.max(10, Math.min(13, 12));
          ctx.font = `${labelFontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(layerLabels[i], layer[0].x, topY - 45);
        }
      });

      ctx.restore();

      // Zoom indicator
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
  }, [neurons, connections, isAnimating, animationSpeed, selectedNeuron, layerConfig, propagationActive]);

  // --- Mouse event handlers ---
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

      const newOffsetX = mouseX - (mouseX - offsetX) * (newZoom / zoom);
      const newOffsetY = mouseY - (mouseY - offsetY) * (newZoom / zoom);

      viewRef.current = { offsetX: newOffsetX, offsetY: newOffsetY, zoom: newZoom };
      setViewState({ offsetX: newOffsetX, offsetY: newOffsetY, zoom: newZoom });
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY, hasMoved: false };
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          dragRef.current.hasMoved = true;
        }
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        viewRef.current.offsetX += dx;
        viewRef.current.offsetY += dy;
        setViewState({ ...viewRef.current });
        return;
      }

      // Hover detection
      const { offsetX, offsetY, zoom } = viewRef.current;
      const worldX = (mouseX - offsetX) / zoom;
      const worldY = (mouseY - offsetY) / zoom;

      let found = false;
      for (const layer of neurons) {
        for (const neuron of layer) {
          const dx = worldX - neuron.x;
          const dy = worldY - neuron.y;
          if (Math.sqrt(dx * dx + dy * dy) < 24) {
            hoveredNeuronRef.current = { layer: neuron.layerIndex, index: neuron.neuronIndex };
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) hoveredNeuronRef.current = null;

      if (!dragRef.current.isDragging) {
        canvas.style.cursor = found ? "pointer" : "grab";
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const wasDragging = dragRef.current.hasMoved;
      dragRef.current.isDragging = false;
      dragRef.current.hasMoved = false;
      canvas.style.cursor = "grab";

      // Click detection (not drag)
      if (!wasDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const { offsetX, offsetY, zoom } = viewRef.current;
        const worldX = (mouseX - offsetX) / zoom;
        const worldY = (mouseY - offsetY) / zoom;

        let clickedNeuron: { layer: number; index: number } | null = null;
        for (const layer of neurons) {
          for (const neuron of layer) {
            const dx = worldX - neuron.x;
            const dy = worldY - neuron.y;
            if (Math.sqrt(dx * dx + dy * dy) < 24) {
              clickedNeuron = { layer: neuron.layerIndex, index: neuron.neuronIndex };
              break;
            }
          }
          if (clickedNeuron) break;
        }

        if (clickedNeuron) {
          // Toggle selection
          if (selectedNeuron?.layer === clickedNeuron.layer && selectedNeuron?.index === clickedNeuron.index) {
            setSelectedNeuron(null);
          } else {
            setSelectedNeuron(clickedNeuron);
          }
        } else {
          setSelectedNeuron(null);
        }
      }
    };

    const handleMouseLeave = () => {
      dragRef.current.isDragging = false;
      dragRef.current.hasMoved = false;
      canvas.style.cursor = "grab";
      hoveredNeuronRef.current = null;
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Touch support
    let lastTouchDist = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current = { isDragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, hasMoved: false };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current.isDragging) {
        const dx = e.touches[0].clientX - dragRef.current.lastX;
        const dy = e.touches[0].clientY - dragRef.current.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.hasMoved = true;
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
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!dragRef.current.hasMoved && e.changedTouches.length === 1) {
        // Tap to select
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const mouseX = touch.clientX - rect.left;
        const mouseY = touch.clientY - rect.top;
        const { offsetX, offsetY, zoom } = viewRef.current;
        const worldX = (mouseX - offsetX) / zoom;
        const worldY = (mouseY - offsetY) / zoom;

        let clickedNeuron: { layer: number; index: number } | null = null;
        for (const layer of neurons) {
          for (const neuron of layer) {
            const dx = worldX - neuron.x;
            const dy = worldY - neuron.y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
              clickedNeuron = { layer: neuron.layerIndex, index: neuron.neuronIndex };
              break;
            }
          }
          if (clickedNeuron) break;
        }

        if (clickedNeuron) {
          if (selectedNeuron?.layer === clickedNeuron.layer && selectedNeuron?.index === clickedNeuron.index) {
            setSelectedNeuron(null);
          } else {
            setSelectedNeuron(clickedNeuron);
          }
        } else {
          setSelectedNeuron(null);
        }
      }
      dragRef.current.isDragging = false;
      dragRef.current.hasMoved = false;
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
  }, [neurons, selectedNeuron]);

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

  // Get neuron detail data for selected neuron
  const getSelectedNeuronDetail = () => {
    if (!selectedNeuron || !neurons[selectedNeuron.layer]) return null;
    const neuron = neurons[selectedNeuron.layer]?.[selectedNeuron.index];
    if (!neuron) return null;

    const layerLabel = getLayerLabel(selectedNeuron.layer, layerConfig.length);
    let neuronLabel: string;
    if (selectedNeuron.layer === 0) {
      neuronLabel = `X${selectedNeuron.index + 1}`;
    } else if (selectedNeuron.layer === layerConfig.length - 1) {
      neuronLabel = `Y${selectedNeuron.index + 1}`;
    } else {
      neuronLabel = `H${selectedNeuron.layer}.${selectedNeuron.index + 1}`;
    }

    // For input neurons, no incoming connections
    if (selectedNeuron.layer === 0) {
      return {
        neuronLabel,
        layerLabel,
        value: neuron.value,
        rawValue: neuron.rawValue,
        isInput: true,
        incomingWeights: [] as { fromValue: number; weight: number; product: number; fromLabel: string }[],
        bias: 0,
        weightedSum: neuron.rawValue,
        activatedValue: neuron.value,
      };
    }

    // Get incoming connections
    const prevLayer = neurons[selectedNeuron.layer - 1];
    const layerWeights = weights[selectedNeuron.layer - 1];
    const bias = biases[selectedNeuron.layer - 1]?.[selectedNeuron.index] ?? 0;

    const incomingWeights = prevLayer?.map((prevNeuron, i) => {
      const w = layerWeights?.[selectedNeuron.index]?.[i] ?? 0;
      const prevLabel = selectedNeuron.layer - 1 === 0
        ? `x${i + 1}`
        : `h${selectedNeuron.layer - 1}.${i + 1}`;
      return {
        fromValue: prevNeuron.value,
        weight: w,
        product: prevNeuron.value * w,
        fromLabel: prevLabel,
      };
    }) ?? [];

    const weightedSum = incomingWeights.reduce((s, iw) => s + iw.product, 0) + bias;
    const isLast = selectedNeuron.layer === layerConfig.length - 1;
    const actFn = isLast ? outputActivation : activationFn;

    return {
      neuronLabel,
      layerLabel,
      value: neuron.value,
      rawValue: neuron.rawValue,
      isInput: false,
      incomingWeights,
      bias,
      weightedSum,
      activatedValue: neuron.value,
      activationFnName: actFn,
    };
  };

  const selectedDetail = getSelectedNeuronDetail();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
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
          拖曳移動 · 滾輪縮放 · 點擊神經元查看詳情
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(560px+2rem)]">
        {/* Selected Neuron Detail Panel */}
        {selectedDetail && (
          <div className="p-4 rounded-xl bg-[var(--surface)] border-2 border-amber-500/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-amber-400 text-sm">
                神經元詳情 — {selectedDetail.neuronLabel}
              </h3>
              <button
                onClick={() => setSelectedNeuron(null)}
                className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] text-lg leading-none"
              >
                ×
              </button>
            </div>

            {selectedDetail.isInput ? (
              <div className="text-sm font-mono text-[var(--foreground)]/80">
                <div>輸入值：<span className="text-cyan-400 font-bold">{selectedDetail.value.toFixed(2)}</span></div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Weighted sum breakdown */}
                <div className="space-y-1">
                  {selectedDetail.incomingWeights.map((iw, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs font-mono">
                      <span className="text-cyan-400">{iw.fromValue.toFixed(2)}</span>
                      <span className="text-[var(--foreground)]/40">×</span>
                      <span className={iw.weight >= 0 ? "text-cyan-300" : "text-pink-400"}>{iw.weight.toFixed(2)}</span>
                      <span className="text-[var(--foreground)]/40">=</span>
                      <span className="text-[var(--foreground)]/70">{iw.product.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] my-2" />

                {/* Sum */}
                <div className="text-xs font-mono">
                  <span className="text-[var(--foreground)]/50">Σ = </span>
                  <span className="text-white font-bold">
                    {selectedDetail.incomingWeights.reduce((s, iw) => s + iw.product, 0).toFixed(2)}
                  </span>
                </div>

                {/* Bias */}
                <div className="text-xs font-mono">
                  <span className="text-[var(--foreground)]/50">+ bias </span>
                  <span className={selectedDetail.bias >= 0 ? "text-cyan-300" : "text-pink-400"}>
                    {selectedDetail.bias.toFixed(2)}
                  </span>
                  <span className="text-[var(--foreground)]/50"> = </span>
                  <span className="text-white font-bold">{selectedDetail.weightedSum.toFixed(2)}</span>
                </div>

                {/* Activation */}
                <div className="mt-2 px-3 py-2 rounded-lg bg-cyan-900/30 border border-cyan-700/30">
                  <span className="text-xs font-mono text-cyan-400">
                    {selectedDetail.activationFnName}({selectedDetail.weightedSum.toFixed(2)}) = {selectedDetail.activatedValue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activation Value Overview */}
        {neurons.length > 0 && (
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold mb-3 text-sm">激活值總覽</h3>
            <div className="flex gap-3">
              {neurons.map((layer, li) => (
                <div key={li} className="flex-1 min-w-0">
                  <div className="text-[10px] text-center text-[var(--foreground)]/40 mb-1.5 font-mono">
                    {li === 0 ? "IN" : li === layerConfig.length - 1 ? "OUT" : `H${li}`}
                  </div>
                  <div className="space-y-1">
                    {layer.map((neuron) => {
                      const isSel = selectedNeuron?.layer === neuron.layerIndex && selectedNeuron?.index === neuron.neuronIndex;
                      const val = neuron.value;
                      let bgColor: string;
                      if (val < -0.01) {
                        bgColor = "bg-pink-500/30 text-pink-300";
                      } else if (val < 0.01) {
                        bgColor = "bg-gray-500/20 text-gray-400";
                      } else {
                        bgColor = "bg-cyan-500/30 text-cyan-300";
                      }
                      return (
                        <button
                          key={neuron.neuronIndex}
                          onClick={() => {
                            if (isSel) setSelectedNeuron(null);
                            else setSelectedNeuron({ layer: neuron.layerIndex, index: neuron.neuronIndex });
                          }}
                          className={`w-full text-[10px] font-mono px-1 py-0.5 rounded transition-all ${bgColor} ${
                            isSel ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-[var(--surface)]" : "hover:brightness-125"
                          }`}
                        >
                          {val.toFixed(2)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-between mt-3 text-[9px] text-[var(--foreground)]/40">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-pink-500/40" /> 負值</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-gray-500/30" /> ≈0</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-cyan-500/40" /> 正值</div>
            </div>
          </div>
        )}

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

        {/* Tip */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--foreground)]/60 leading-relaxed">
          <span className="text-amber-400">💡</span>{" "}
          點擊任一神經元查看詳細的加權求和計算。滑鼠懸停連接線可看到權重值。試試不同架構和激活函數的效果。
        </div>
      </div>
    </div>
  );
}
