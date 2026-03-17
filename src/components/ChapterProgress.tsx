"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "neurallab-chapter-progress";

interface ProgressData {
  [chapterId: number]: {
    completed: boolean;
    lastVisited: string;
    scrollPercent: number;
  };
}

function getProgress(): ProgressData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Hook for tutorials list page to show completion badges
export function useChapterProgress() {
  const [progress, setProgress] = useState<ProgressData>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return progress;
}

// Mark chapter as completed
export function markChapterComplete(chapterId: number) {
  const data = getProgress();
  data[chapterId] = {
    ...data[chapterId],
    completed: true,
    lastVisited: new Date().toISOString(),
    scrollPercent: 100,
  };
  saveProgress(data);
}

// Reading progress bar (fixed top)
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-[var(--border)]">
      <div
        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Chapter keyboard navigation
export function ChapterKeyboardNav({
  prevChapter,
  nextChapter,
}: {
  prevChapter?: number;
  nextChapter?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevChapter) {
        router.push(`/tutorials/chapter/${prevChapter}`);
      } else if (e.key === "ArrowRight") {
        if (nextChapter) {
          router.push(`/tutorials/chapter/${nextChapter}`);
        } else {
          router.push("/sandbox");
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevChapter, nextChapter, router]);

  return null;
}

// Track chapter visit and scroll progress
export function ChapterTracker({ chapterId }: { chapterId: number }) {
  useEffect(() => {
    // Mark as visited
    const data = getProgress();
    data[chapterId] = {
      completed: data[chapterId]?.completed || false,
      lastVisited: new Date().toISOString(),
      scrollPercent: data[chapterId]?.scrollPercent || 0,
    };
    saveProgress(data);

    // Track scroll progress
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, (scrollTop / docHeight) * 100);
        const current = getProgress();
        const prev = current[chapterId]?.scrollPercent || 0;
        if (percent > prev) {
          current[chapterId] = {
            ...current[chapterId],
            scrollPercent: percent,
          };
          // Mark complete if scrolled > 90%
          if (percent > 90) {
            current[chapterId].completed = true;
          }
          saveProgress(current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterId]);

  return null;
}

// Table of contents extracted from sections
export function ChapterTableOfContents({
  sections,
}: {
  sections: { type: string; content: string }[];
}) {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from text sections
  const headings: { id: string; text: string; level: number }[] = [];
  sections.forEach((section, si) => {
    if (section.type === "text") {
      const lines = section.content.split("\n");
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) {
          const text = trimmed.slice(4);
          headings.push({ id: `heading-${si}-${headings.length}`, text, level: 3 });
        } else if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3);
          headings.push({ id: `heading-${si}-${headings.length}`, text, level: 2 });
        }
      });
    }
  });

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    // Add IDs to rendered headings
    const allHeadings = document.querySelectorAll(
      ".tutorial-content h2, .tutorial-content h3"
    );
    allHeadings.forEach((el, i) => {
      if (!el.id) {
        // Match by index to our extracted headings
        if (i < headings.length) {
          el.id = headings[i].id;
        }
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  }, []);

  if (headings.length < 2) return null;

  return (
    <div className="fixed right-4 top-24 z-30">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg glass border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
        title="章節目錄"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </button>

      {/* TOC panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 max-h-[60vh] overflow-y-auto glass rounded-xl border border-[var(--border)] p-3 shadow-xl">
          <div className="text-xs font-semibold text-[var(--foreground)]/50 mb-2 px-2">
            章節目錄
          </div>
          <nav className="space-y-0.5">
            {headings.map((h) => (
              <button
                key={h.id}
                onClick={() => scrollTo(h.id)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                  h.level === 3 ? "pl-5" : ""
                } ${
                  activeId === h.id
                    ? "bg-[var(--primary)]/15 text-[var(--primary-light)]"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--surface-light)]"
                }`}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

// Progress badge for tutorials list
export function ProgressBadge({ chapterId }: { chapterId: number }) {
  const [completed, setCompleted] = useState(false);
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    const data = getProgress();
    if (data[chapterId]) {
      setVisited(true);
      setCompleted(data[chapterId].completed);
    }
  }, [chapterId]);

  if (completed) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
        已完成
      </span>
    );
  }
  if (visited) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
        進行中
      </span>
    );
  }
  return null;
}
