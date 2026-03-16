"use client";

import { useState, useCallback } from "react";
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

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput("");

    const logs: string[] = [];
    const mockConsole = {
      log: (...args: unknown[]) => {
        logs.push(
          args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
            )
            .join(" ")
        );
      },
      error: (...args: unknown[]) => {
        logs.push("[ERROR] " + args.map((a) => String(a)).join(" "));
      },
      warn: (...args: unknown[]) => {
        logs.push("[WARN] " + args.map((a) => String(a)).join(" "));
      },
    };

    try {
      const fn = new Function("console", code);
      fn(mockConsole);
      setOutput(logs.join("\n"));
    } catch (err) {
      setOutput(logs.join("\n") + (logs.length ? "\n" : "") + "[ERROR] " + String(err));
    }

    setIsRunning(false);
  }, [code]);

  const resetCode = () => {
    setCode(initialCode);
    setOutput("");
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
          <button
            onClick={runCode}
            disabled={isRunning}
            className="text-xs px-4 py-1 rounded-md bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 transition-colors font-medium disabled:opacity-50"
          >
            {isRunning ? "執行中..." : "▶ 執行"}
          </button>
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
      {output && (
        <div className="border-t border-[var(--border)]">
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 bg-[var(--surface-light)]">
            輸出結果
          </div>
          <pre className="p-4 text-sm font-mono text-[var(--secondary)] overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
