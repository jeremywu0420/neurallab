"use client";

import { useEffect, useRef } from "react";

interface Neuron {
  x: number;
  y: number;
  r: number;
  pulse: number;
  pulseSpeed: number;
  connections: number[];
}

interface Signal {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: number; // 0=primary, 1=cyan, 2=accent
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const neurons: Neuron[] = [];
    const signals: Signal[] = [];

    const signalColors = [
      [99, 102, 241],   // indigo
      [34, 211, 238],   // cyan
      [244, 114, 182],  // pink
    ];

    const init = () => {
      neurons.length = 0;
      signals.length = 0;

      // Scatter neurons across the full page area
      const area = w * h;
      const count = Math.min(Math.floor(area / 22000), 140);

      for (let i = 0; i < count; i++) {
        neurons.push({
          x: Math.random() * w,
          y: Math.random() * h * 3, // cover scrollable area
          r: Math.random() * 2 + 1.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.005,
          connections: [],
        });
      }

      // Build connections: each neuron connects to 2-4 nearest neighbors
      const maxDist = Math.min(w, h) * 0.28;
      for (let i = 0; i < neurons.length; i++) {
        const dists: { idx: number; d: number }[] = [];
        for (let j = 0; j < neurons.length; j++) {
          if (i === j) continue;
          const dx = neurons[i].x - neurons[j].x;
          const dy = neurons[i].y - neurons[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            dists.push({ idx: j, d });
          }
        }
        dists.sort((a, b) => a.d - b.d);
        const connCount = Math.min(dists.length, Math.floor(Math.random() * 3) + 2);
        for (let k = 0; k < connCount; k++) {
          const j = dists[k].idx;
          if (!neurons[i].connections.includes(j)) {
            neurons[i].connections.push(j);
          }
          if (!neurons[j].connections.includes(i)) {
            neurons[j].connections.push(i);
          }
        }
      }
    };

    const spawnSignal = () => {
      if (neurons.length === 0) return;
      // Pick a random neuron that has connections
      const candidates = neurons.filter((n) => n.connections.length > 0);
      if (candidates.length === 0) return;
      const src = candidates[Math.floor(Math.random() * candidates.length)];
      const srcIdx = neurons.indexOf(src);
      const tgtIdx = src.connections[Math.floor(Math.random() * src.connections.length)];

      signals.push({
        from: srcIdx,
        to: tgtIdx,
        progress: 0,
        speed: Math.random() * 0.008 + 0.004,
        color: Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2,
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };

    resize();
    window.addEventListener("resize", resize);

    // Spawn signals periodically
    const signalInterval = setInterval(() => {
      // Keep ~15-25 signals alive
      const toSpawn = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < toSpawn; i++) {
        if (signals.length < 30) spawnSignal();
      }
    }, 300);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Scroll offset for parallax
      const scrollY = typeof window !== "undefined" ? window.scrollY * 0.3 : 0;

      // Draw connections (static lines)
      const drawn = new Set<string>();
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        const ny = n.y - scrollY;

        for (const j of n.connections) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (drawn.has(key)) continue;
          drawn.add(key);

          const m = neurons[j];
          const my = m.y - scrollY;

          // Skip if both off screen
          if ((ny < -50 && my < -50) || (ny > h + 50 && my > h + 50)) continue;

          ctx.beginPath();
          ctx.moveTo(n.x, ny);
          ctx.lineTo(m.x, my);
          ctx.strokeStyle = "rgba(99, 102, 241, 0.06)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        sig.progress += sig.speed;

        if (sig.progress >= 1) {
          // Chain reaction: sometimes the signal continues to the next neuron
          const arrived = neurons[sig.to];
          if (Math.random() < 0.45 && arrived.connections.length > 1) {
            // Pick a different connection
            const nextOptions = arrived.connections.filter((c) => c !== sig.from);
            if (nextOptions.length > 0) {
              const next = nextOptions[Math.floor(Math.random() * nextOptions.length)];
              signals[i] = {
                from: sig.to,
                to: next,
                progress: 0,
                speed: sig.speed * (0.9 + Math.random() * 0.2),
                color: sig.color,
              };
              // Pulse the arrived neuron
              arrived.pulse = 0;
              continue;
            }
          }
          // Pulse the arrived neuron
          arrived.pulse = 0;
          signals.splice(i, 1);
          continue;
        }

        const fromN = neurons[sig.from];
        const toN = neurons[sig.to];
        const fy = fromN.y - scrollY;
        const ty = toN.y - scrollY;

        // Skip if off screen
        if (fy < -50 && ty < -50) continue;
        if (fy > h + 50 && ty > h + 50) continue;

        const sx = fromN.x + (toN.x - fromN.x) * sig.progress;
        const sy = fy + (ty - fy) * sig.progress;

        const [cr, cg, cb] = signalColors[sig.color];

        // Signal trail (glowing line segment)
        const trailLen = 0.15;
        const trailStart = Math.max(0, sig.progress - trailLen);
        const tsx = fromN.x + (toN.x - fromN.x) * trailStart;
        const tsy = fy + (ty - fy) * trailStart;

        const grad = ctx.createLinearGradient(tsx, tsy, sx, sy);
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0.5)`);
        ctx.beginPath();
        ctx.moveTo(tsx, tsy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Signal head glow
        const headGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
        headGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.6)`);
        headGrad.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, 0.15)`);
        headGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = headGrad;
        ctx.fillRect(sx - 12, sy - 12, 24, 24);

        // Bright head dot
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.9)`;
        ctx.fill();
      }

      // Draw neurons
      for (const n of neurons) {
        const ny = n.y - scrollY;
        if (ny < -30 || ny > h + 30) continue;

        n.pulse += n.pulseSpeed;
        const pulseAlpha = 0.15 + Math.sin(n.pulse) * 0.1;
        const clampedAlpha = Math.max(0.05, Math.min(0.6, pulseAlpha));

        // When pulse is near 0 (just fired), show bright flash
        const fireFlash = n.pulse < 0.5 ? (0.5 - n.pulse) * 1.2 : 0;
        const totalAlpha = Math.min(1, clampedAlpha + fireFlash);

        // Outer glow
        if (totalAlpha > 0.15) {
          const glowGrad = ctx.createRadialGradient(n.x, ny, 0, n.x, ny, n.r * 8);
          glowGrad.addColorStop(0, `rgba(99, 102, 241, ${totalAlpha * 0.2})`);
          glowGrad.addColorStop(0.5, `rgba(99, 102, 241, ${totalAlpha * 0.05})`);
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = glowGrad;
          ctx.fillRect(n.x - n.r * 8, ny - n.r * 8, n.r * 16, n.r * 16);
        }

        // Core
        ctx.beginPath();
        ctx.arc(n.x, ny, n.r * (1 + fireFlash * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 190, 255, ${totalAlpha})`;
        ctx.fill();
      }

      animId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId.current);
      clearInterval(signalInterval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
