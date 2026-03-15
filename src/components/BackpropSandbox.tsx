"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// --- Types ---
type ActivationFn = "sigmoid" | "tanh" | "relu";

interface NeuronData {
  value: number;      // activated value
  rawValue: number;   // pre-activation
  gradient: number;   // ∂Loss/∂(activated output)
  x: number;
  y: number;
}

type Phase = "idle" | "forward" | "backward" | "update";

function activate(x: number, fn: ActivationFn): number {
  switch (fn) {
    case "sigmoid": return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
    case "tanh": return Math.tanh(x);
    case "relu": return Math.max(0, x);
  }
}

function activateDerivative(activated: number, raw: number, fn: ActivationFn): number {
  switch (fn) {
    case "sigmoid": return activated * (1 - activated);
    case "tanh": return 1 - activated * activated;
    case "relu": return raw > 0 ? 1 : 0;
  }
}

// --- Particle for animation ---
interface AnimParticle {
  fromX: number; fromY: number;
  toX: number; toY: number;
  progress: number;
  value: number;
  type: "forward" | "backward" | "update";
  targetLayer: number;
  targetIndex: number;
}

// --- Component ---
export function BackpropSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<AnimParticle[]>([]);

  const viewRef = useRef({ offsetX: 0, offsetY: 0, zoom: 1 });
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0, hasMoved: false });
  const [, setViewState] = useState({ offsetX: 0, offsetY: 0, zoom: 1 });

  // Network config: simple 2 → 3 → 1 for XOR
  const layerSizes = [2, 3, 1];
  const [activationFn, setActivationFn] = useState<ActivationFn>("sigmoid");
  const [learningRate, setLearningRate] = useState(0.5);
  const [targets, setTargets] = useState([1.0]);

  // Weights & biases (mutable refs for training)
  const weightsRef = useRef<number[][][]>([]);
  const biasesRef = useRef<number[][]>([]);
  const [weights, setWeightsState] = useState<number[][][]>([]);
  const [biases, setBiasesState] = useState<number[][]>([]);

  // Neuron data
  const [neuronData, setNeuronData] = useState<NeuronData[][]>([]);
  const [inputs, setInputs] = useState([1.0, 0.0]);
  const [loss, setLoss] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);

  // Animation
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [selectedNeuron, setSelectedNeuron] = useState<{ layer: number; index: number } | null>(null);
  const [autoTrain, setAutoTrain] = useState(false);
  const autoTrainRef = useRef(false);
  const litNeuronsRef = useRef<Set<string>>(new Set());
  const [, setLitTick] = useState(0); // force re-render for lit state

  // XOR training data
  const xorData = [
    { input: [0, 0], target: [0] },
    { input: [0, 1], target: [1] },
    { input: [1, 0], target: [1] },
    { input: [1, 1], target: [0] },
  ];
  const [xorIndex, setXorIndex] = useState(0);

  const neuronKey = (l: number, i: number) => `${l}-${i}`;

  // Initialize weights
  const initWeights = useCallback(() => {
    const w: number[][][] = [];
    const b: number[][] = [];
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const scale = Math.sqrt(2 / (layerSizes[l] + layerSizes[l + 1]));
      w.push(
        Array.from({ length: layerSizes[l + 1] }, () =>
          Array.from({ length: layerSizes[l] }, () => parseFloat(((Math.random() * 2 - 1) * scale).toFixed(3)))
        )
      );
      b.push(Array.from({ length: layerSizes[l + 1] }, () => parseFloat((Math.random() * 0.4 - 0.2).toFixed(3))));
    }
    weightsRef.current = w;
    biasesRef.current = b;
    setWeightsState(w.map(l => l.map(r => [...r])));
    setBiasesState(b.map(l => [...l]));
    setEpoch(0);
    setLossHistory([]);
  }, []);

  useEffect(() => { initWeights(); }, [initWeights]);

  // Layout constants
  const SPACING_Y = 90;
  const SPACING_X = 200;

  // Compute neuron positions
  const getPositions = useCallback(() => {
    const maxN = Math.max(...layerSizes);
    const worldH = (maxN + 1) * SPACING_Y;
    const positions: { x: number; y: number }[][] = [];
    for (let l = 0; l < layerSizes.length; l++) {
      const layerH = (layerSizes[l] - 1) * SPACING_Y;
      const startY = (worldH - layerH) / 2;
      const x = SPACING_X * (l + 1);
      positions.push(
        Array.from({ length: layerSizes[l] }, (_, i) => ({
          x,
          y: startY + i * SPACING_Y,
        }))
      );
    }
    return positions;
  }, []);

  // Forward pass
  const forwardPass = useCallback((inp: number[]) => {
    const positions = getPositions();
    const w = weightsRef.current;
    const b = biasesRef.current;
    if (w.length === 0) return [];

    const data: NeuronData[][] = [];
    // Input layer
    data.push(inp.map((v, i) => ({
      value: v, rawValue: v, gradient: 0,
      x: positions[0][i].x, y: positions[0][i].y,
    })));

    let currentValues = [...inp];
    for (let l = 0; l < w.length; l++) {
      const layerData: NeuronData[] = [];
      const newValues: number[] = [];
      for (let j = 0; j < layerSizes[l + 1]; j++) {
        let sum = b[l]?.[j] ?? 0;
        for (let i = 0; i < currentValues.length; i++) {
          sum += currentValues[i] * (w[l]?.[j]?.[i] ?? 0);
        }
        const activated = activate(sum, activationFn);
        layerData.push({
          value: activated, rawValue: sum, gradient: 0,
          x: positions[l + 1][j].x, y: positions[l + 1][j].y,
        });
        newValues.push(activated);
      }
      data.push(layerData);
      currentValues = newValues;
    }
    return data;
  }, [getPositions, activationFn]);

  // Backward pass (compute gradients)
  const backwardPass = useCallback((data: NeuronData[][], tgt: number[]) => {
    const w = weightsRef.current;
    // Output gradients
    const outputLayer = data[data.length - 1];
    for (let j = 0; j < outputLayer.length; j++) {
      const pred = outputLayer[j].value;
      const dLoss = pred - tgt[j]; // MSE derivative
      const dAct = activateDerivative(pred, outputLayer[j].rawValue, activationFn);
      outputLayer[j].gradient = dLoss * dAct;
    }

    // Hidden layer gradients
    for (let l = data.length - 2; l >= 1; l--) {
      for (let i = 0; i < data[l].length; i++) {
        let gradSum = 0;
        for (let j = 0; j < data[l + 1].length; j++) {
          gradSum += data[l + 1][j].gradient * (w[l]?.[j]?.[i] ?? 0);
        }
        const dAct = activateDerivative(data[l][i].value, data[l][i].rawValue, activationFn);
        data[l][i].gradient = gradSum * dAct;
      }
    }

    // Input layer gradients (for display)
    for (let i = 0; i < data[0].length; i++) {
      let gradSum = 0;
      for (let j = 0; j < data[1].length; j++) {
        gradSum += data[1][j].gradient * (w[0]?.[j]?.[i] ?? 0);
      }
      data[0][i].gradient = gradSum;
    }

    return data;
  }, [activationFn]);

  // Update weights
  const updateWeights = useCallback((data: NeuronData[][], lr: number) => {
    const w = weightsRef.current;
    const b = biasesRef.current;
    for (let l = 0; l < w.length; l++) {
      for (let j = 0; j < w[l].length; j++) {
        for (let i = 0; i < w[l][j].length; i++) {
          w[l][j][i] -= lr * data[l + 1][j].gradient * data[l][i].value;
        }
        b[l][j] -= lr * data[l + 1][j].gradient;
      }
    }
    setWeightsState(w.map(l => l.map(r => [...r])));
    setBiasesState(b.map(l => [...l]));
  }, []);

  // Compute and display
  const recompute = useCallback(() => {
    const data = forwardPass(inputs);
    if (data.length === 0) return;
    setNeuronData(data);
    const pred = data[data.length - 1].map(n => n.value);
    const l = pred.reduce((s, p, i) => s + 0.5 * (p - targets[i]) ** 2, 0);
    setLoss(l);
  }, [inputs, targets, forwardPass]);

  useEffect(() => { recompute(); }, [recompute]);

  // Fit to view
  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || neuronData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width, ch = rect.height;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const layer of neuronData) {
      for (const n of layer) {
        minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y);
      }
    }
    const PAD = 70;
    minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD;
    const netW = maxX - minX, netH = maxY - minY;
    const zoom = Math.min(cw / netW, ch / netH, 2);
    const offsetX = (cw - netW * zoom) / 2 - minX * zoom;
    const offsetY = (ch - netH * zoom) / 2 - minY * zoom;
    viewRef.current = { offsetX, offsetY, zoom };
    setViewState({ offsetX, offsetY, zoom });
  }, [neuronData]);

  useEffect(() => { if (neuronData.length > 0) fitToView(); }, [neuronData.length, fitToView]);

  // --- Animation: forward → backward → update ---
  const runAnimatedStep = useCallback(() => {
    if (phaseRef.current !== "idle") return;

    const currentInput = inputs;
    const currentTarget = targets;

    // Phase 1: Forward
    phaseRef.current = "forward";
    setPhase("forward");

    const data = forwardPass(currentInput);
    if (data.length === 0) return;
    setNeuronData(data);

    // Light only input neurons
    const initialLit = new Set<string>();
    data[0].forEach((_, i) => initialLit.add(neuronKey(0, i)));
    litNeuronsRef.current = initialLit;
    setLitTick(t => t + 1);

    // Create forward particles
    const fwdParticles: AnimParticle[] = [];
    const w = weightsRef.current;
    for (let l = 0; l < w.length; l++) {
      for (let j = 0; j < w[l].length; j++) {
        for (let i = 0; i < w[l][j].length; i++) {
          fwdParticles.push({
            fromX: data[l][i].x, fromY: data[l][i].y,
            toX: data[l + 1][j].x, toY: data[l + 1][j].y,
            progress: -l * 0.4,
            value: data[l][i].value * w[l][j][i],
            type: "forward",
            targetLayer: l + 1,
            targetIndex: j,
          });
        }
      }
    }
    particlesRef.current = fwdParticles;

    // After forward finishes, start backward
    const fwdDuration = (w.length * 0.4 + 1) / (0.015 * 1) * 16 + 500;
    setTimeout(() => {
      // Backward pass
      const bwdData = backwardPass(data, currentTarget);
      setNeuronData([...bwdData]);
      const pred = bwdData[bwdData.length - 1].map(n => n.value);
      const l = pred.reduce((s, p, i) => s + 0.5 * (p - currentTarget[i]) ** 2, 0);
      setLoss(l);

      phaseRef.current = "backward";
      setPhase("backward");

      // All neurons lit for backward
      const allLit = new Set<string>();
      bwdData.forEach((layer, li) => layer.forEach((_, ni) => allLit.add(neuronKey(li, ni))));
      litNeuronsRef.current = allLit;
      setLitTick(t => t + 1);

      // Create backward particles (reverse direction)
      const bwdParticles: AnimParticle[] = [];
      for (let l = w.length - 1; l >= 0; l--) {
        for (let j = 0; j < w[l].length; j++) {
          for (let i = 0; i < w[l][j].length; i++) {
            const layerDelay = (w.length - 1 - l) * 0.4;
            bwdParticles.push({
              fromX: bwdData[l + 1][j].x, fromY: bwdData[l + 1][j].y,
              toX: bwdData[l][i].x, toY: bwdData[l][i].y,
              progress: -layerDelay,
              value: bwdData[l + 1][j].gradient,
              type: "backward",
              targetLayer: l,
              targetIndex: i,
            });
          }
        }
      }
      particlesRef.current = bwdParticles;

      // After backward finishes, update weights
      const bwdDuration = (w.length * 0.4 + 1) / (0.015 * 1) * 16 + 500;
      setTimeout(() => {
        phaseRef.current = "update";
        setPhase("update");
        particlesRef.current = [];

        updateWeights(bwdData, learningRate);
        setEpoch(e => e + 1);
        setLossHistory(h => [...h.slice(-99), l]);

        // Flash update
        setTimeout(() => {
          phaseRef.current = "idle";
          setPhase("idle");
          litNeuronsRef.current = new Set();
          setLitTick(t => t + 1);

          // Recompute with new weights
          const newData = forwardPass(currentInput);
          if (newData.length > 0) {
            setNeuronData(newData);
            const newPred = newData[newData.length - 1].map(n => n.value);
            const newL = newPred.reduce((s, p, i) => s + 0.5 * (p - currentTarget[i]) ** 2, 0);
            setLoss(newL);
          }

          // Auto-train next step
          if (autoTrainRef.current) {
            setTimeout(() => {
              if (autoTrainRef.current) runAnimatedStep();
            }, 100);
          }
        }, 400);
      }, bwdDuration);
    }, fwdDuration);
  }, [inputs, targets, forwardPass, backwardPass, updateWeights, learningRate]);

  // Instant training step (no animation)
  const instantStep = useCallback(() => {
    const data = forwardPass(inputs);
    if (data.length === 0) return;
    const bwdData = backwardPass(data, targets);
    updateWeights(bwdData, learningRate);
    setEpoch(e => e + 1);
    const pred = bwdData[bwdData.length - 1].map(n => n.value);
    const l = pred.reduce((s, p, i) => s + 0.5 * (p - targets[i]) ** 2, 0);
    setLoss(l);
    setLossHistory(h => [...h.slice(-99), l]);
    recompute();
  }, [inputs, targets, forwardPass, backwardPass, updateWeights, learningRate, recompute]);

  // Auto-train (instant, fast)
  useEffect(() => {
    if (!autoTrain) return;
    autoTrainRef.current = true;
    const interval = setInterval(() => {
      if (!autoTrainRef.current) return;
      // Cycle through XOR data
      setXorIndex(prev => {
        const idx = prev % 4;
        const d = xorData[idx];
        setInputs(d.input);
        setTargets(d.target);
        return prev + 1;
      });
      instantStep();
    }, 50);
    return () => { clearInterval(interval); autoTrainRef.current = false; };
  }, [autoTrain, instantStep]);

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
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width, ch = rect.height;
      ctx.clearRect(0, 0, cw, ch);

      const { offsetX, offsetY, zoom } = viewRef.current;
      const currentPhase = phaseRef.current;
      const currentLit = litNeuronsRef.current;
      const isPropagating = currentLit.size > 0;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);

      const w = weightsRef.current;
      if (neuronData.length === 0 || w.length === 0) {
        ctx.restore();
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const isLit = (l: number, i: number) => !isPropagating || currentLit.has(neuronKey(l, i));

      // Draw connections
      for (let l = 0; l < w.length; l++) {
        for (let j = 0; j < w[l].length; j++) {
          for (let i = 0; i < w[l][j].length; i++) {
            const from = neuronData[l]?.[i];
            const to = neuronData[l + 1]?.[j];
            if (!from || !to) continue;

            const wVal = w[l][j][i];
            const absW = Math.abs(wVal);
            const isPositive = wVal >= 0;

            const fromLit = isLit(l, i);
            const toLit = isLit(l + 1, j);
            const connLit = fromLit && toLit;

            const isSel = selectedNeuron && (
              (selectedNeuron.layer === l + 1 && selectedNeuron.index === j) ||
              (selectedNeuron.layer === l && selectedNeuron.index === i)
            );

            let opacity: number;
            if (isSel) {
              opacity = Math.min(0.95, absW * 0.8 + 0.3);
            } else if (isPropagating && !connLit) {
              opacity = 0.05;
            } else {
              opacity = Math.min(0.7, absW * 0.7 + 0.1);
            }

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);

            if (currentPhase === "update" && connLit) {
              // Flash green during update
              ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`;
            } else if (isSel) {
              ctx.strokeStyle = isPositive
                ? `rgba(34, 211, 238, ${opacity})`
                : `rgba(244, 114, 182, ${opacity})`;
            } else {
              ctx.strokeStyle = isPositive
                ? `rgba(99, 102, 241, ${opacity})`
                : `rgba(244, 114, 182, ${opacity})`;
            }
            ctx.lineWidth = Math.max(0.5, absW * 2.5) / zoom;
            ctx.stroke();

            // Draw backward gradient dashes during backward phase
            if (currentPhase === "backward" && connLit) {
              ctx.save();
              ctx.setLineDash([4 / zoom, 6 / zoom]);
              ctx.beginPath();
              ctx.moveTo(to.x, to.y);
              ctx.lineTo(from.x, from.y);
              const grad = neuronData[l + 1]?.[j]?.gradient ?? 0;
              const gradAbs = Math.min(1, Math.abs(grad) * 3);
              ctx.strokeStyle = grad >= 0
                ? `rgba(251, 191, 36, ${gradAbs * 0.5 + 0.1})`
                : `rgba(168, 85, 247, ${gradAbs * 0.5 + 0.1})`;
              ctx.lineWidth = 1.5 / zoom;
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // Particles
      let anyActive = false;
      particlesRef.current.forEach(p => {
        p.progress += 0.018;
        if (p.progress >= 0 && p.progress <= 1) {
          anyActive = true;
          const x = p.fromX + (p.toX - p.fromX) * p.progress;
          const y = p.fromY + (p.toY - p.fromY) * p.progress;
          const absVal = Math.min(1, Math.abs(p.value));
          const radius = (3 + absVal * 3) / zoom;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          if (p.type === "forward") {
            ctx.fillStyle = p.value >= 0
              ? `rgba(34, 211, 238, ${0.6 + absVal * 0.4})`
              : `rgba(244, 114, 182, ${0.6 + absVal * 0.4})`;
          } else {
            ctx.fillStyle = p.value >= 0
              ? `rgba(251, 191, 36, ${0.6 + absVal * 0.4})`
              : `rgba(168, 85, 247, ${0.6 + absVal * 0.4})`;
          }
          ctx.fill();

          // Glow
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
          if (p.type === "forward") {
            ctx.fillStyle = `rgba(34, 211, 238, ${0.08 + absVal * 0.06})`;
          } else {
            ctx.fillStyle = `rgba(251, 191, 36, ${0.08 + absVal * 0.06})`;
          }
          ctx.fill();
        } else if (p.progress < 1) {
          anyActive = true;
        }

        // Light up neuron when particle arrives
        if (p.progress >= 1 && p.type === "forward") {
          const key = neuronKey(p.targetLayer, p.targetIndex);
          if (!currentLit.has(key)) {
            currentLit.add(key);
          }
        }
      });

      // Draw neurons
      neuronData.forEach((layer, li) => {
        layer.forEach((neuron, ni) => {
          const lit = isLit(li, ni);
          const isSel = selectedNeuron?.layer === li && selectedNeuron?.index === ni;
          const absVal = Math.min(1, Math.abs(neuron.value));
          const absGrad = Math.min(1, Math.abs(neuron.gradient) * 3);
          const radius = isSel ? 24 : 20;

          // Gradient glow ring (during backward / when gradients exist)
          if (neuron.gradient !== 0 && lit && (currentPhase === "backward" || currentPhase === "update")) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 12, 0, Math.PI * 2);
            ctx.fillStyle = neuron.gradient >= 0
              ? `rgba(251, 191, 36, ${absGrad * 0.2})`
              : `rgba(168, 85, 247, ${absGrad * 0.2})`;
            ctx.fill();
          }

          // Selected dashed border
          if (isSel) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 5, 0, Math.PI * 2);
            ctx.setLineDash([4 / zoom, 3 / zoom]);
            ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Value glow
          if (absVal > 0.1 && lit) {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = neuron.value >= 0
              ? `rgba(34, 211, 238, ${absVal * 0.12})`
              : `rgba(244, 114, 182, ${absVal * 0.12})`;
            ctx.fill();
          }

          // Main circle
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, radius);
          if (!lit) {
            gradient.addColorStop(0, "rgba(80, 80, 100, 0.4)");
            gradient.addColorStop(1, "rgba(50, 50, 70, 0.3)");
          } else if (currentPhase === "update") {
            gradient.addColorStop(0, `rgba(74, 222, 128, ${0.3 + absVal * 0.4})`);
            gradient.addColorStop(1, `rgba(74, 222, 128, ${0.1 + absVal * 0.2})`);
          } else if (neuron.value >= 0) {
            gradient.addColorStop(0, `rgba(34, 211, 238, ${0.3 + absVal * 0.5})`);
            gradient.addColorStop(1, `rgba(34, 211, 238, ${0.1 + absVal * 0.2})`);
          } else {
            gradient.addColorStop(0, `rgba(244, 114, 182, ${0.3 + absVal * 0.5})`);
            gradient.addColorStop(1, `rgba(58, 58, 92, 0.8)`);
          }
          ctx.fillStyle = gradient;
          ctx.fill();

          // Border
          if (isSel) {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
            ctx.lineWidth = 2.5 / zoom;
          } else if (!lit) {
            ctx.strokeStyle = "rgba(100, 100, 130, 0.3)";
            ctx.lineWidth = 1 / zoom;
          } else if (currentPhase === "update") {
            ctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
            ctx.lineWidth = 2 / zoom;
          } else {
            ctx.strokeStyle = neuron.value >= 0
              ? "rgba(34, 211, 238, 0.5)"
              : "rgba(244, 114, 182, 0.5)";
            ctx.lineWidth = 1.5 / zoom;
          }
          ctx.stroke();

          // Label above
          let label: string;
          if (li === 0) label = `x${ni + 1}`;
          else if (li === layerSizes.length - 1) label = `y${ni + 1}`;
          else label = `h${li}.${ni + 1}`;

          ctx.fillStyle = lit ? "rgba(34, 211, 238, 0.6)" : "rgba(100, 100, 130, 0.3)";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(label, neuron.x, neuron.y - radius - 4);

          // Value
          ctx.fillStyle = lit ? "rgba(255, 255, 255, 0.95)" : "rgba(100, 100, 130, 0.4)";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y);

          // Gradient value below (when in backward/update phase)
          if (lit && neuron.gradient !== 0 && (currentPhase === "backward" || currentPhase === "update")) {
            ctx.fillStyle = neuron.gradient >= 0
              ? "rgba(251, 191, 36, 0.8)"
              : "rgba(168, 85, 247, 0.8)";
            ctx.font = "9px monospace";
            ctx.textBaseline = "top";
            ctx.fillText(`∂${neuron.gradient.toFixed(3)}`, neuron.x, neuron.y + radius + 4);
          }
        });
      });

      // Layer labels
      const labels = ["輸入層", "隱藏層", "輸出層"];
      neuronData.forEach((layer, i) => {
        if (layer.length > 0) {
          const topY = Math.min(...layer.map(n => n.y));
          ctx.fillStyle = "rgba(224, 224, 232, 0.4)";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(labels[Math.min(i, 2)] + (i > 0 && i < layerSizes.length - 1 ? ` ${i}` : ""), layer[0].x, topY - 50);
        }
      });

      ctx.restore();

      // Zoom indicator
      ctx.fillStyle = "rgba(224, 224, 232, 0.3)";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(zoom * 100)}%`, cw - 12, ch - 12);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [neuronData, selectedNeuron]);

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const { offsetX, offsetY, zoom } = viewRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.min(5, Math.max(0.1, zoom * factor));
      viewRef.current = {
        offsetX: mx - (mx - offsetX) * (newZoom / zoom),
        offsetY: my - (my - offsetY) * (newZoom / zoom),
        zoom: newZoom,
      };
      setViewState({ ...viewRef.current });
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY, hasMoved: false };
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.hasMoved = true;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        viewRef.current.offsetX += dx;
        viewRef.current.offsetY += dy;
        setViewState({ ...viewRef.current });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const wasDrag = dragRef.current.hasMoved;
      dragRef.current.isDragging = false;
      dragRef.current.hasMoved = false;
      canvas.style.cursor = "grab";

      if (!wasDrag) {
        const rect = canvas.getBoundingClientRect();
        const { offsetX, offsetY, zoom } = viewRef.current;
        const wx = (e.clientX - rect.left - offsetX) / zoom;
        const wy = (e.clientY - rect.top - offsetY) / zoom;

        let clicked: { layer: number; index: number } | null = null;
        for (const layer of neuronData) {
          for (const n of layer) {
            const dx = wx - n.x, dy = wy - n.y;
            if (Math.sqrt(dx * dx + dy * dy) < 26) {
              clicked = { layer: neuronData.indexOf(layer), index: layer.indexOf(n) };
              break;
            }
          }
          if (clicked) break;
        }
        if (clicked) {
          if (selectedNeuron?.layer === clicked.layer && selectedNeuron?.index === clicked.index) {
            setSelectedNeuron(null);
          } else {
            setSelectedNeuron(clicked);
          }
        } else {
          setSelectedNeuron(null);
        }
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", () => {
      dragRef.current.isDragging = false;
      canvas.style.cursor = "grab";
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [neuronData, selectedNeuron]);

  // Get selected neuron detail
  const getDetail = () => {
    if (!selectedNeuron || !neuronData[selectedNeuron.layer]) return null;
    const n = neuronData[selectedNeuron.layer][selectedNeuron.index];
    if (!n) return null;

    const li = selectedNeuron.layer;
    const ni = selectedNeuron.index;
    let label: string;
    if (li === 0) label = `X${ni + 1}`;
    else if (li === layerSizes.length - 1) label = `Y${ni + 1}`;
    else label = `H${li}.${ni + 1}`;

    if (li === 0) {
      return { label, isInput: true, value: n.value, gradient: n.gradient, incoming: [] as { fromLabel: string; fromValue: number; weight: number; product: number }[], bias: 0, rawValue: n.rawValue, activatedValue: n.value };
    }

    const prevLayer = neuronData[li - 1];
    const lw = weightsRef.current[li - 1];
    const bias = biasesRef.current[li - 1]?.[ni] ?? 0;

    const incoming = prevLayer.map((pn, pi) => {
      const fromLabel = li - 1 === 0 ? `x${pi + 1}` : `h${li - 1}.${pi + 1}`;
      const weight = lw?.[ni]?.[pi] ?? 0;
      return { fromLabel, fromValue: pn.value, weight, product: pn.value * weight };
    });

    return { label, isInput: false, value: n.value, gradient: n.gradient, incoming, bias, rawValue: n.rawValue, activatedValue: n.value };
  };

  const detail = getDetail();

  // Phase label
  const phaseLabel = { idle: "待命", forward: "⟶ 前向傳播", backward: "⟵ 反向傳播", update: "✓ 權重更新" }[phase];
  const phaseColor = { idle: "text-[var(--foreground)]/40", forward: "text-cyan-400", backward: "text-amber-400", update: "text-green-400" }[phase];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Canvas */}
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Phase status bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${phaseColor} bg-[var(--surface)]/80 backdrop-blur border border-[var(--border)]`}>
            {phaseLabel}
          </div>
          {epoch > 0 && (
            <div className="px-3 py-1 rounded-full text-xs font-mono text-[var(--foreground)]/50 bg-[var(--surface)]/80 backdrop-blur border border-[var(--border)]">
              Epoch: {epoch} · Loss: {loss.toFixed(4)}
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: "520px", cursor: "grab" }}
        />

        <div className="absolute top-3 right-3 flex gap-1">
          <button onClick={fitToView}
            className="px-2 py-1 text-xs rounded-md bg-[var(--surface-light)]/80 backdrop-blur text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] transition-colors">
            適應畫面
          </button>
        </div>
        <div className="absolute bottom-3 left-3 text-[10px] text-[var(--foreground)]/30 pointer-events-none">
          拖曳移動 · 滾輪縮放 · 點擊神經元查看詳情
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(520px+2rem)]">
        {/* Selected Detail */}
        {detail && (
          <div className="p-4 rounded-xl bg-[var(--surface)] border-2 border-amber-500/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-amber-400 text-sm">神經元詳情 — {detail.label}</h3>
              <button onClick={() => setSelectedNeuron(null)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] text-lg leading-none">×</button>
            </div>
            {detail.isInput ? (
              <div className="text-sm font-mono">
                <div>輸入值：<span className="text-cyan-400 font-bold">{detail.value.toFixed(2)}</span></div>
                {detail.gradient !== 0 && (
                  <div className="mt-1">梯度：<span className={detail.gradient >= 0 ? "text-amber-400" : "text-purple-400"}>{detail.gradient.toFixed(4)}</span></div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-[10px] text-[var(--foreground)]/40 mb-1">前向計算</div>
                {detail.incoming.map((iw, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs font-mono">
                    <span className="text-cyan-400">{iw.fromValue.toFixed(2)}</span>
                    <span className="text-[var(--foreground)]/40">×</span>
                    <span className={iw.weight >= 0 ? "text-cyan-300" : "text-pink-400"}>{iw.weight.toFixed(3)}</span>
                    <span className="text-[var(--foreground)]/40">=</span>
                    <span className="text-[var(--foreground)]/70">{iw.product.toFixed(3)}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] my-1" />
                <div className="text-xs font-mono">
                  <span className="text-[var(--foreground)]/50">Σ = </span>
                  <span className="text-white font-bold">{detail.incoming.reduce((s, iw) => s + iw.product, 0).toFixed(3)}</span>
                </div>
                <div className="text-xs font-mono">
                  <span className="text-[var(--foreground)]/50">+ bias </span>
                  <span className={detail.bias >= 0 ? "text-cyan-300" : "text-pink-400"}>{detail.bias.toFixed(3)}</span>
                  <span className="text-[var(--foreground)]/50"> = </span>
                  <span className="text-white font-bold">{detail.rawValue.toFixed(3)}</span>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-xs font-mono text-cyan-400">
                  {activationFn}({detail.rawValue.toFixed(3)}) = {detail.activatedValue.toFixed(3)}
                </div>
                {detail.gradient !== 0 && (
                  <>
                    <div className="text-[10px] text-[var(--foreground)]/40 mt-2">反向梯度</div>
                    <div className="px-2 py-1.5 rounded-lg bg-amber-900/20 border border-amber-700/30 text-xs font-mono">
                      <span className={detail.gradient >= 0 ? "text-amber-400" : "text-purple-400"}>
                        ∂Loss/∂out = {detail.gradient.toFixed(4)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loss Curve */}
        {lossHistory.length > 1 && (
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold mb-2 text-sm">Loss 曲線</h3>
            <div className="h-16 flex items-end gap-px">
              {lossHistory.map((l, i) => {
                const maxL = Math.max(...lossHistory, 0.01);
                const h = Math.max(2, (l / maxL) * 60);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${h}px`,
                      backgroundColor: l > 0.1 ? "rgba(244, 114, 182, 0.6)" : l > 0.01 ? "rgba(251, 191, 36, 0.6)" : "rgba(74, 222, 128, 0.6)",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-[var(--foreground)]/30 mt-1 font-mono">
              <span>{Math.max(0, epoch - lossHistory.length)}</span>
              <span>Epoch {epoch}</span>
            </div>
          </div>
        )}

        {/* Inputs & Targets */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-2 text-sm">輸入 & 目標</h3>
          <div className="space-y-2">
            {inputs.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-[var(--foreground)]/50 w-8">x{i + 1}</span>
                <input type="range" min={-1} max={1} step={0.1} value={v}
                  onChange={e => { const ni = [...inputs]; ni[i] = parseFloat(e.target.value); setInputs(ni); }}
                  className="flex-1 accent-cyan-400" />
                <span className="text-xs font-mono w-10 text-right">{v.toFixed(1)}</span>
              </div>
            ))}
            <div className="border-t border-[var(--border)] my-1" />
            {targets.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-amber-400/70 w-8">t{i + 1}</span>
                <input type="range" min={0} max={1} step={0.1} value={v}
                  onChange={e => { const nt = [...targets]; nt[i] = parseFloat(e.target.value); setTargets(nt); }}
                  className="flex-1 accent-amber-400" />
                <span className="text-xs font-mono w-10 text-right">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
          {/* XOR presets */}
          <div className="mt-2">
            <div className="text-[10px] text-[var(--foreground)]/40 mb-1">XOR 資料預設</div>
            <div className="flex gap-1">
              {xorData.map((d, i) => (
                <button key={i}
                  onClick={() => { setInputs(d.input); setTargets(d.target); }}
                  className={`flex-1 text-[10px] px-1 py-1 rounded font-mono transition-colors ${
                    inputs[0] === d.input[0] && inputs[1] === d.input[1]
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-[var(--surface-light)] text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60"
                  }`}
                >
                  {d.input[0]},{d.input[1]}→{d.target[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Training Controls */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-2 text-sm">訓練控制</h3>
          <div className="space-y-2">
            <button
              onClick={runAnimatedStep}
              disabled={phase !== "idle" || autoTrain}
              className="w-full text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-amber-600 text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {phase !== "idle" ? "動畫中..." : "▶ 前向 + 反向（動畫）"}
            </button>
            <button
              onClick={instantStep}
              disabled={autoTrain}
              className="w-full text-sm px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-light)] disabled:opacity-40 transition-colors"
            >
              ⚡ 快速訓練一步
            </button>
            <button
              onClick={() => { setAutoTrain(!autoTrain); autoTrainRef.current = !autoTrain; }}
              className={`w-full text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                autoTrain
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
              }`}
            >
              {autoTrain ? "⏹ 停止自動訓練" : "🔄 自動訓練（XOR）"}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground)]/50">學習率</span>
              <input type="range" min={0.01} max={2} step={0.01} value={learningRate}
                onChange={e => setLearningRate(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400" />
              <span className="text-xs font-mono w-10 text-right">{learningRate.toFixed(2)}</span>
            </div>

            <div className="flex gap-1">
              <label className="text-xs text-[var(--foreground)]/50 w-16 pt-1">激活函數</label>
              {(["sigmoid", "tanh", "relu"] as ActivationFn[]).map(fn => (
                <button key={fn}
                  onClick={() => setActivationFn(fn)}
                  className={`flex-1 text-xs px-2 py-1 rounded-lg font-mono transition-colors ${
                    activationFn === fn ? "bg-[var(--primary)]/30 text-[var(--primary-light)]" : "bg-[var(--surface-light)] text-[var(--foreground)]/40"
                  }`}>
                  {fn}
                </button>
              ))}
            </div>

            <button onClick={() => { setAutoTrain(false); autoTrainRef.current = false; initWeights(); }}
              className="w-full text-xs px-4 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-light)] transition-colors text-[var(--foreground)]/50">
              重新初始化權重
            </button>
          </div>
        </div>

        {/* Output values */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="font-semibold mb-2 text-sm">輸出結果</h3>
          <div className="space-y-1">
            {neuronData[neuronData.length - 1]?.map((n, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--foreground)]/50">y{i + 1}</span>
                <div className="flex-1 h-4 bg-[var(--surface-light)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500/60 transition-all" style={{ width: `${Math.abs(n.value) * 100}%` }} />
                </div>
                <span className="text-xs font-mono w-12 text-right text-cyan-400">{n.value.toFixed(4)}</span>
                <span className="text-xs font-mono w-12 text-right text-amber-400/60">(t: {targets[i]?.toFixed(1)})</span>
              </div>
            ))}
            <div className="text-xs font-mono text-[var(--foreground)]/40 mt-1">
              Loss: {loss.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--foreground)]/60 leading-relaxed">
          <div className="flex gap-3 mb-1.5">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-cyan-400" /> 前向訊號</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> 反向梯度</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-400" /> 權重更新</span>
          </div>
          點擊神經元查看前向計算 + 反向梯度細節。試試不同學習率觀察收斂速度！
        </div>
      </div>
    </div>
  );
}
