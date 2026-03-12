import { getTutorial, tutorials } from "@/lib/tutorials";
import { TutorialRenderer } from "@/components/TutorialRenderer";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return tutorials.map((t) => ({ id: String(t.id) }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapterId = parseInt(id, 10);
  const tutorial = getTutorial(chapterId);

  if (!tutorial) return notFound();

  return (
    <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/50 mb-8">
        <Link href="/tutorials" className="hover:text-[var(--primary-light)]">
          教學課程
        </Link>
        <span>/</span>
        <span>第 {tutorial.id} 章</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{tutorial.icon}</span>
          <div>
            <span className="text-sm font-mono text-[var(--primary-light)]">
              Chapter {tutorial.id}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">{tutorial.title}</h1>
          </div>
        </div>
        <p className="text-lg text-[var(--foreground)]/60">{tutorial.subtitle}</p>
      </div>

      {/* Content */}
      <TutorialRenderer sections={tutorial.sections} />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
        {tutorial.prevChapter ? (
          <Link
            href={`/tutorials/chapter/${tutorial.prevChapter}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>上一章</span>
          </Link>
        ) : (
          <div />
        )}
        {tutorial.nextChapter ? (
          <Link
            href={`/tutorials/chapter/${tutorial.nextChapter}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary-light)] hover:bg-[var(--primary)]/30 transition-colors"
          >
            <span>下一章</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/sandbox"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary-light)] hover:bg-[var(--primary)]/30 transition-colors"
          >
            <span>前往沙盒</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
