"use client";

import { useState, useCallback, useRef } from "react";
import type { TutorialSection, CodeStep, CodingExercise } from "@/lib/tutorials";
import { CodeRunner } from "./CodeRunner";
import { DiagramSection } from "./TutorialDiagrams";

function TextSection({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let inList = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      elements.push(
        <p key={elements.length} className="text-[var(--foreground)]/80 leading-relaxed mb-4">
          <FormattedText text={text} />
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-2 mb-4 text-[var(--foreground)]/80">
          {listItems.map((item, i) => (
            <li key={i}>
              <FormattedText text={item} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h2 key={elements.length} className="text-2xl font-bold mt-8 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h3 key={elements.length} className="text-xl font-semibold mt-6 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      if (!inList) flushList();
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
    } else if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!inList) flushList();
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith("`") && trimmed.endsWith("`") && !trimmed.startsWith("``")) {
      flushParagraph();
      flushList();
      elements.push(
        <div key={elements.length} className="my-4 p-4 rounded-lg bg-[var(--surface-light)] border border-[var(--border)] font-mono text-sm text-[var(--secondary)] overflow-x-auto">
          {trimmed.slice(1, -1)}
        </div>
      );
    } else if (trimmed === "") {
      flushParagraph();
      if (inList) flushList();
    } else {
      if (inList) flushList();
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  return <div>{elements}</div>;
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-[var(--foreground)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface-light)] text-[var(--secondary)] text-sm font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function QuizSection({ content }: { content: string }) {
  const quiz = JSON.parse(content);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="my-8 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
          小測驗
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-4">{quiz.question}</h3>
      <div className="space-y-2 mb-4">
        {quiz.options.map((option: string, i: number) => {
          let className = "w-full text-left p-3 rounded-lg border transition-colors ";
          if (showAnswer) {
            if (i === quiz.correct) {
              className += "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]";
            } else if (i === selected) {
              className += "border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]";
            } else {
              className += "border-[var(--border)] text-[var(--foreground)]/50";
            }
          } else if (i === selected) {
            className += "border-[var(--primary)] bg-[var(--primary)]/10";
          } else {
            className += "border-[var(--border)] hover:border-[var(--primary)]/50";
          }

          return (
            <button
              key={i}
              className={className}
              onClick={() => !showAnswer && setSelected(i)}
              disabled={showAnswer}
            >
              <span className="font-mono text-sm mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {!showAnswer ? (
        <button
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium disabled:opacity-50"
          disabled={selected === null}
          onClick={() => setShowAnswer(true)}
        >
          確認答案
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${selected === quiz.correct ? "bg-[var(--success)]/10 border border-[var(--success)]/30" : "bg-[var(--surface-light)]"}`}>
          <p className="font-semibold mb-1">
            {selected === quiz.correct ? "正確！" : "不太對"}
          </p>
          <p className="text-sm text-[var(--foreground)]/70">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
}

// --- New: Step-by-step code walkthrough ---
function CodeStepSection({ fullCode, steps }: { fullCode: string; steps: CodeStep[] }) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = show full preview
  const totalSteps = steps.length;

  return (
    <div className="my-8 rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-light)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[var(--primary)]/20 text-[var(--primary)]">
            逐步解析
          </span>
          <span className="text-xs text-[var(--foreground)]/50">
            {currentStep === -1
              ? "完整程式碼預覽"
              : `步驟 ${currentStep + 1} / ${totalSteps}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentStep(-1)}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              currentStep === -1
                ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                : "hover:bg-[var(--surface)] text-[var(--foreground)]/60"
            }`}
          >
            完整預覽
          </button>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep <= 0}
            className="text-xs px-3 py-1 rounded-md hover:bg-[var(--surface)] text-[var(--foreground)]/60 disabled:opacity-30 transition-colors"
          >
            上一步
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={currentStep >= totalSteps - 1}
            className="text-xs px-3 py-1 rounded-md hover:bg-[var(--surface)] text-[var(--foreground)]/60 disabled:opacity-30 transition-colors"
          >
            下一步
          </button>
        </div>
      </div>

      {/* Code display */}
      <div className="relative">
        <pre className="p-4 text-sm font-mono leading-[1.6] overflow-x-auto text-[var(--foreground)]/90">
          <code>
            {currentStep === -1
              ? fullCode
              : steps[currentStep].code}
          </code>
        </pre>
      </div>

      {/* Step explanation */}
      {currentStep >= 0 && (
        <div className="border-t border-[var(--border)] px-5 py-4 bg-[var(--primary)]/5">
          <h4 className="font-semibold text-[var(--primary)] mb-2">
            {steps[currentStep].title}
          </h4>
          <p className="text-sm text-[var(--foreground)]/70 leading-relaxed whitespace-pre-line">
            {steps[currentStep].explanation}
          </p>
        </div>
      )}

      {/* Full preview hint */}
      {currentStep === -1 && (
        <div className="border-t border-[var(--border)] px-5 py-4 bg-[var(--surface-light)]">
          <p className="text-sm text-[var(--foreground)]/60">
            這是完整的程式碼預覽。點擊「下一步」開始逐行解析每個部分的含義。
          </p>
          <button
            onClick={() => setCurrentStep(0)}
            className="mt-3 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            開始逐步學習
          </button>
        </div>
      )}

      {/* Step progress bar */}
      {currentStep >= 0 && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-light)]">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i <= currentStep
                    ? "bg-[var(--primary)]"
                    : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- New: Coding exercise component ---
function CodingExerciseSection({ exercise }: { exercise: CodingExercise }) {
  const [code, setCode] = useState(exercise.starterCode);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; got: string }[]>([]);
  const [showHint, setShowHint] = useState(-1);
  const [showSolution, setShowSolution] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runTests = useCallback(() => {
    const logs: string[] = [];
    const mockConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((a) => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
      },
      error: (...args: unknown[]) => { logs.push("[ERROR] " + args.map(String).join(" ")); },
      warn: (...args: unknown[]) => { logs.push("[WARN] " + args.map(String).join(" ")); },
    };

    const results: typeof testResults = [];

    try {
      const fn = new Function("console", code + "\n\nreturn typeof solution !== 'undefined' ? solution : null;");
      fn(mockConsole);

      // Run each test case
      for (const tc of exercise.testCases) {
        try {
          const testFn = new Function("console", code + "\n" + tc.input);
          const testLogs: string[] = [];
          const testConsole = {
            log: (...args: unknown[]) => {
              testLogs.push(args.map((a) => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
            },
            error: (...args: unknown[]) => { testLogs.push("[ERROR] " + args.map(String).join(" ")); },
            warn: (...args: unknown[]) => { testLogs.push("[WARN] " + args.map(String).join(" ")); },
          };
          testFn(testConsole);
          const got = testLogs.join("\n").trim();
          results.push({
            passed: got === tc.expected.trim(),
            input: tc.input,
            expected: tc.expected.trim(),
            got,
          });
        } catch (err) {
          results.push({
            passed: false,
            input: tc.input,
            expected: tc.expected.trim(),
            got: String(err),
          });
        }
      }
    } catch (err) {
      logs.push("[ERROR] " + String(err));
    }

    setOutput(logs.join("\n"));
    setTestResults(results);
  }, [code, exercise.testCases]);

  const lineCount = code.split("\n").length;
  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);

  return (
    <div className="my-8 rounded-2xl border-2 border-dashed border-[var(--secondary)]/40 overflow-hidden bg-[var(--surface)]">
      {/* Header */}
      <div className="px-5 py-4 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[var(--secondary)]/20 text-[var(--secondary)]">
            編程練習
          </span>
          {allPassed && (
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
              通過！
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold">{exercise.title}</h3>
        <p className="text-sm text-[var(--foreground)]/70 mt-1 whitespace-pre-line">{exercise.description}</p>
      </div>

      {/* Code editor */}
      <div className="relative code-editor">
        <div className="flex">
          <div className="select-none text-right pr-3 pl-3 py-4 text-[var(--foreground)]/20 text-sm leading-[1.6] border-r border-[var(--border)] bg-[var(--surface)]">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent text-[var(--foreground)] font-mono text-sm leading-[1.6] resize-none outline-none min-h-[200px]"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-light)]">
        <div className="flex items-center gap-2">
          <button
            onClick={runTests}
            className="text-sm px-4 py-2 rounded-lg bg-[var(--secondary)]/20 text-[var(--secondary)] hover:bg-[var(--secondary)]/30 transition-colors font-medium"
          >
            執行測試
          </button>
          <button
            onClick={() => { setCode(exercise.starterCode); setOutput(""); setTestResults([]); }}
            className="text-sm px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--foreground)]/60 transition-colors"
          >
            重置
          </button>
        </div>
        <div className="flex items-center gap-2">
          {exercise.hints.length > 0 && (
            <button
              onClick={() => setShowHint(Math.min(showHint + 1, exercise.hints.length - 1))}
              className="text-sm px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--warning)] transition-colors"
            >
              {showHint < 0 ? "需要提示？" : showHint < exercise.hints.length - 1 ? "更多提示" : "已顯示所有提示"}
            </button>
          )}
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-sm px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--foreground)]/40 transition-colors"
          >
            {showSolution ? "隱藏答案" : "查看答案"}
          </button>
        </div>
      </div>

      {/* Hints */}
      {showHint >= 0 && (
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--warning)]/5">
          {exercise.hints.slice(0, showHint + 1).map((hint, i) => (
            <p key={i} className="text-sm text-[var(--warning)] mb-1">
              <span className="font-semibold">提示 {i + 1}：</span>{hint}
            </p>
          ))}
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div className="border-t border-[var(--border)]">
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 bg-[var(--surface-light)]">
            參考答案
          </div>
          <pre className="p-4 text-sm font-mono text-[var(--foreground)]/70 overflow-x-auto whitespace-pre-wrap bg-[var(--surface)]">
            {exercise.solution}
          </pre>
        </div>
      )}

      {/* Test results */}
      {testResults.length > 0 && (
        <div className="border-t border-[var(--border)]">
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 bg-[var(--surface-light)]">
            測試結果 ({testResults.filter((r) => r.passed).length}/{testResults.length} 通過)
          </div>
          <div className="p-4 space-y-2">
            {testResults.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  r.passed
                    ? "bg-[var(--success)]/10 border border-[var(--success)]/30"
                    : "bg-[var(--error)]/10 border border-[var(--error)]/30"
                }`}
              >
                <div className="font-mono text-xs mb-1 text-[var(--foreground)]/50">{r.input}</div>
                {r.passed ? (
                  <span className="text-[var(--success)] font-medium">通過</span>
                ) : (
                  <div>
                    <span className="text-[var(--error)]">期望：{r.expected}</span>
                    <span className="text-[var(--foreground)]/50 mx-2">|</span>
                    <span className="text-[var(--error)]">得到：{r.got}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console output */}
      {output && (
        <div className="border-t border-[var(--border)]">
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 bg-[var(--surface-light)]">
            控制台輸出
          </div>
          <pre className="p-4 text-sm font-mono text-[var(--secondary)] overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

export function TutorialRenderer({ sections }: { sections: TutorialSection[] }) {
  return (
    <div className="tutorial-content">
      {sections.map((section, i) => {
        switch (section.type) {
          case "text":
            return <TextSection key={i} content={section.content} />;
          case "code":
            return (
              <div key={i} className="my-8">
                <CodeRunner
                  initialCode={section.content}
                  explanation={section.explanation}
                />
              </div>
            );
          case "quiz":
            return <QuizSection key={i} content={section.content} />;
          case "code-step":
            return (
              <CodeStepSection
                key={i}
                fullCode={section.content}
                steps={section.steps || []}
              />
            );
          case "coding-exercise":
            return section.exercise ? (
              <CodingExerciseSection key={i} exercise={section.exercise} />
            ) : null;
          case "image":
            return (
              <figure key={i} className="my-8 flex flex-col items-center">
                <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.src || section.content}
                    alt={section.caption || "教學插圖"}
                    className="w-full h-auto"
                  />
                </div>
                {section.caption && (
                  <figcaption className="mt-3 text-sm text-[var(--foreground)]/50 text-center italic">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "diagram":
            return (
              <DiagramSection
                key={i}
                diagram={section.diagram || section.content}
                caption={section.caption}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
