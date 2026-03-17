"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

function NeuralNetwork404({ width = 400, height = 300 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Neuron positions in a broken network
    const neurons: { x: number; y: number; layer: number; broken: boolean }[] = [];
    const layers = [3, 5, 5, 2];
    layers.forEach((count, li) => {
      const x = (width / (layers.length + 1)) * (li + 1);
      for (let i = 0; i < count; i++) {
        const y = (height / (count + 1)) * (i + 1);
        const broken = Math.random() < 0.3;
        neurons.push({ x, y, layer: li, broken });
      }
    });

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw connections (some broken/faded)
      neurons.forEach((n) => {
        neurons.forEach((m) => {
          if (m.layer === n.layer + 1) {
            const isBroken = n.broken || m.broken;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            if (isBroken) {
              // Broken connection - dashed and red
              ctx.setLineDash([4, 6]);
              ctx.strokeStyle = `rgba(248, 113, 113, ${0.15 + 0.05 * Math.sin(frame * 0.03)})`;
            } else {
              ctx.setLineDash([]);
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 + 0.04 * Math.sin(frame * 0.02)})`;
            }
            ctx.lineTo(m.x, m.y);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      ctx.setLineDash([]);

      // Draw neurons
      neurons.forEach((n) => {
        const pulse = Math.sin(frame * 0.04 + n.x * 0.01) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.broken ? 4 : 6, 0, Math.PI * 2);
        if (n.broken) {
          ctx.fillStyle = `rgba(248, 113, 113, ${0.4 * pulse})`;
          ctx.strokeStyle = "rgba(248, 113, 113, 0.6)";
        } else {
          ctx.fillStyle = `rgba(99, 102, 241, ${0.5 * pulse})`;
          ctx.strokeStyle = "rgba(129, 140, 248, 0.8)";
        }
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow
        if (!n.broken) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${0.05 * pulse})`;
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="opacity-60" />;
}

export default function NotFound() {
  return (
    <div className="page-transition min-h-[80vh] flex flex-col items-center justify-center px-4">
      <NeuralNetwork404 />

      <div className="text-center -mt-8">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-[var(--error)] to-[var(--accent)] bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-2">
          神經元連接中斷
        </h2>
        <p className="text-[var(--foreground)]/50 mb-8 max-w-md">
          這個頁面似乎在反向傳播中丟失了。讓我們回到已知的路徑重新開始。
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[var(--primary)]/20 text-[var(--primary-light)] hover:bg-[var(--primary)]/30 transition-colors font-medium"
          >
            回到首頁
          </Link>
          <Link
            href="/tutorials"
            className="px-6 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
          >
            前往教學課程
          </Link>
        </div>
      </div>
    </div>
  );
}
