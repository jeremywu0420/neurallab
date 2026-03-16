"use client";

import { useEffect, useRef } from "react";

// 3D grid node on a wavy surface
interface Node3D {
  x: number;
  y: number;
  z: number;
  baseZ: number;
  // projected
  sx: number;
  sy: number;
  size: number;
  alpha: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animId = useRef(0);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    // Grid parameters
    const cols = 48;
    const rows = 28;
    const spacing = 40;

    // 3D grid of nodes
    const nodes: Node3D[] = [];

    const initGrid = () => {
      nodes.length = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c - cols / 2) * spacing;
          const y = (r - rows / 2) * spacing;
          nodes.push({
            x,
            y,
            z: 0,
            baseZ: 0,
            sx: 0,
            sy: 0,
            size: 0,
            alpha: 0,
          });
        }
      }
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
    };

    const onMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX / w;
      mouse.current.y = e.clientY / h;
    };

    initGrid();
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    // Perspective projection
    const fov = 600;
    const cameraHeight = 280;
    const tilt = 0.65; // how much the surface is tilted toward viewer

    const project = (node: Node3D, t: number) => {
      // Rotate so we look at the surface from above-front angle
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      // Slight horizontal rotation following mouse
      const mouseOffsetX = (mouse.current.x - 0.5) * 0.15;
      const cosM = Math.cos(mouseOffsetX);
      const sinM = Math.sin(mouseOffsetX);

      // Wave displacement
      const wave1 = Math.sin(node.x * 0.008 + t * 0.6) * Math.cos(node.y * 0.006 + t * 0.4) * 35;
      const wave2 = Math.sin(node.x * 0.015 - t * 0.3) * Math.sin(node.y * 0.012 + t * 0.5) * 18;
      const wave3 = Math.cos((node.x + node.y) * 0.005 + t * 0.2) * 12;

      // Mouse ripple
      const mx3d = (mouse.current.x - 0.5) * cols * spacing;
      const my3d = (mouse.current.y - 0.5) * rows * spacing * 0.5;
      const mdx = node.x - mx3d;
      const mdy = node.y - my3d;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const ripple = mDist < 300 ? Math.sin(mDist * 0.03 - t * 3) * (1 - mDist / 300) * 25 : 0;

      node.z = wave1 + wave2 + wave3 + ripple;

      // Apply horizontal mouse rotation
      const rx = node.x * cosM - node.y * sinM;
      const ry = node.x * sinM + node.y * cosM;

      // Apply tilt rotation (around X axis)
      const ry2 = ry * cosT - node.z * sinT;
      const rz = ry * sinT + node.z * cosT + cameraHeight;

      // Perspective divide
      if (rz <= 10) {
        node.alpha = 0;
        return;
      }

      const scale = fov / rz;
      node.sx = w / 2 + rx * scale;
      node.sy = h * 0.55 + ry2 * scale;
      node.size = Math.max(0.5, 2.5 * scale);

      // Depth-based alpha: closer = brighter
      const depthAlpha = Math.max(0, Math.min(1, 1 - (rz - 100) / 900));
      node.alpha = depthAlpha * depthAlpha;
    };

    const draw = () => {
      time.current += 0.008;
      const t = time.current;

      ctx.clearRect(0, 0, w, h);

      // Update all node projections
      for (const node of nodes) {
        project(node, t);
      }

      // Draw connections (lines between grid neighbors)
      ctx.lineWidth = 0.6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const n = nodes[idx];
          if (n.alpha < 0.01) continue;

          // Right neighbor
          if (c < cols - 1) {
            const nb = nodes[idx + 1];
            if (nb.alpha > 0.01) {
              const a = Math.min(n.alpha, nb.alpha) * 0.25;
              ctx.beginPath();
              ctx.moveTo(n.sx, n.sy);
              ctx.lineTo(nb.sx, nb.sy);
              ctx.strokeStyle = `rgba(99, 102, 241, ${a})`;
              ctx.stroke();
            }
          }

          // Bottom neighbor
          if (r < rows - 1) {
            const nb = nodes[idx + cols];
            if (nb.alpha > 0.01) {
              const a = Math.min(n.alpha, nb.alpha) * 0.25;
              ctx.beginPath();
              ctx.moveTo(n.sx, n.sy);
              ctx.lineTo(nb.sx, nb.sy);
              ctx.strokeStyle = `rgba(99, 102, 241, ${a})`;
              ctx.stroke();
            }
          }

          // Diagonal (bottom-right) for triangular mesh
          if (c < cols - 1 && r < rows - 1) {
            const nb = nodes[idx + cols + 1];
            if (nb.alpha > 0.01) {
              const a = Math.min(n.alpha, nb.alpha) * 0.12;
              ctx.beginPath();
              ctx.moveTo(n.sx, n.sy);
              ctx.lineTo(nb.sx, nb.sy);
              ctx.strokeStyle = `rgba(34, 211, 238, ${a})`;
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes (back to front already by row order with tilt)
      for (const n of nodes) {
        if (n.alpha < 0.02) continue;

        // Outer glow
        const glowR = n.size * 5;
        const grad = ctx.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, glowR);
        grad.addColorStop(0, `rgba(99, 102, 241, ${n.alpha * 0.12})`);
        grad.addColorStop(0.5, `rgba(34, 211, 238, ${n.alpha * 0.04})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(n.sx - glowR, n.sy - glowR, glowR * 2, glowR * 2);

        // Core dot
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 190, 255, ${n.alpha * 0.8})`;
        ctx.fill();
      }

      // Top ambient glow (like the image's background light)
      const ambientGrad = ctx.createRadialGradient(
        w * 0.5, h * 0.15, 0,
        w * 0.5, h * 0.15, h * 0.6
      );
      ambientGrad.addColorStop(0, "rgba(99, 102, 241, 0.04)");
      ambientGrad.addColorStop(0.4, "rgba(34, 211, 238, 0.015)");
      ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      animId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
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
