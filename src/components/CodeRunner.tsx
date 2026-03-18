"use client";

import { useState, useCallback, useRef } from "react";
import { HighlightedEditor } from "./SyntaxHighlighter";

interface CodeRunnerProps {
  initialCode: string;
  explanation?: string;
  height?: string;
}

export function CodeRunner({ initialCode, explanation, height = "auto" }: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput("");
    setElapsed(null);

    // Terminate any previous worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Create an inline Web Worker for non-blocking execution
    const workerCode = `
      self.onmessage = function(e) {
        const code = e.data;
        const logs = [];
        const mockConsole = {
          log: function() {
            const args = Array.from(arguments);
            logs.push(args.map(function(a) {
              return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a);
            }).join(" "));
            // Stream output for long-running code
            if (logs.length % 5 === 0) {
              self.postMessage({ type: "progress", output: logs.join("\\n") });
            }
          },
          error: function() { logs.push("[ERROR] " + Array.from(arguments).map(String).join(" ")); },
          warn: function() { logs.push("[WARN] " + Array.from(arguments).map(String).join(" ")); },
        };
        try {
          var fn = new Function("console", code);
          fn(mockConsole);
          self.postMessage({ type: "done", output: logs.join("\\n") });
        } catch (err) {
          self.postMessage({ type: "done", output: logs.join("\\n") + (logs.length ? "\\n" : "") + "[ERROR] " + String(err) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    workerRef.current = worker;
    const startTime = Date.now();

    worker.onmessage = (e) => {
      if (e.data.type === "progress") {
        setOutput(e.data.output);
      } else if (e.data.type === "done") {
        setOutput(e.data.output);
        setIsRunning(false);
        setElapsed(Date.now() - startTime);
        worker.terminate();
        workerRef.current = null;
        URL.revokeObjectURL(url);
      }
    };

    worker.onerror = (err) => {
      setOutput("[ERROR] " + (err.message || "Worker error"));
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
      URL.revokeObjectURL(url);
    };

    // Set a 30-second timeout
    setTimeout(() => {
      if (workerRef.current === worker) {
        worker.terminate();
        workerRef.current = null;
        setOutput((prev) => prev + "\n[TIMEOUT] 執行超過 30 秒，已自動停止");
        setIsRunning(false);
        URL.revokeObjectURL(url);
      }
    }, 30000);

    worker.postMessage(code);
  }, [code]);

  const stopCode = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setOutput((prev) => prev + "\n[STOPPED] 已手動停止執行");
      setIsRunning(false);
    }
  }, []);

  const resetCode = () => {
    setCode(initialCode);
    setOutput("");
    setElapsed(null);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-light)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[var(--error)]/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--warning)]/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--success)]/60" />
          </div>
          <span className="text-xs text-[var(--foreground)]/40 ml-2">JavaScript</span>
          {elapsed !== null && (
            <span className="text-xs text-[var(--foreground)]/30 ml-2">
              {elapsed < 1000 ? `${elapsed}ms` : `${(elapsed / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs px-3 py-1 rounded-md hover:bg-[var(--surface)] text-[var(--foreground)]/60 transition-colors"
            >
              {showExplanation ? "隱藏說明" : "查看說明"}
            </button>
          )}
          <button
            onClick={resetCode}
            className="text-xs px-3 py-1 rounded-md hover:bg-[var(--surface)] text-[var(--foreground)]/60 transition-colors"
          >
            重置
          </button>
          {isRunning ? (
            <button
              onClick={stopCode}
              className="text-xs px-4 py-1 rounded-md bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30 transition-colors font-medium"
            >
              ■ 停止
            </button>
          ) : (
            <button
              onClick={runCode}
              className="text-xs px-4 py-1 rounded-md bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 transition-colors font-medium"
            >
              ▶ 執行
            </button>
          )}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && explanation && (
        <div className="px-4 py-3 bg-[var(--primary)]/10 border-b border-[var(--border)] text-sm text-[var(--foreground)]/70">
          {explanation}
        </div>
      )}

      {/* Code editor with syntax highlighting */}
      <div style={{ height: height === "auto" ? undefined : height }}>
        <HighlightedEditor
          code={code}
          onChange={setCode}
          minHeight="200px"
        />
      </div>

      {/* Output */}
      {(output || isRunning) && (
        <div className="border-t border-[var(--border)]">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--foreground)]/40 bg-[var(--surface-light)]">
            <span>輸出結果</span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[var(--primary)]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                執行中...
              </span>
            )}
          </div>
          <pre className="p-4 text-sm font-mono text-[var(--secondary)] overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
            {output || "等待輸出..."}
          </pre>
        </div>
      )}
    </div>
  );
}
