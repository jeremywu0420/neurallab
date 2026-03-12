"use client";

import { useState } from "react";
import type { TutorialSection } from "@/lib/tutorials";
import { CodeRunner } from "./CodeRunner";

function TextSection({ content }: { content: string }) {
  // Simple markdown-like rendering
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
          default:
            return null;
        }
      })}
    </div>
  );
}
