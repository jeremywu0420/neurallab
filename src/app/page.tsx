import Link from "next/link";

const chapters = [
  { id: 1, title: "什麼是神經網路？", desc: "從生物神經元到人工神經元的基礎概念", icon: "🧠" },
  { id: 2, title: "感知器與線性分類", desc: "理解最簡單的神經網路單元", icon: "⚡" },
  { id: 3, title: "激活函數", desc: "Sigmoid、ReLU、Tanh 的原理與視覺化", icon: "📈" },
  { id: 4, title: "前向傳播", desc: "資料如何在網路中流動", icon: "➡️" },
  { id: 5, title: "損失函數與優化", desc: "衡量模型的好壞並改進它", icon: "🎯" },
  { id: 6, title: "反向傳播", desc: "神經網路如何學習——梯度下降的核心", icon: "🔄" },
  { id: 7, title: "建構完整的神經網路", desc: "從零開始用程式碼建立你的第一個神經網路", icon: "🏗️" },
  { id: 8, title: "過擬合與正則化", desc: "讓模型真正「學會」而不是「背答案」", icon: "🛡️" },
  { id: 9, title: "進階優化器", desc: "比基本梯度下降更聰明的訓練方法", icon: "🚀" },
  { id: 10, title: "卷積神經網路 (CNN)", desc: "專為圖像設計的神經網路架構", icon: "🖼️" },
  { id: 11, title: "循環神經網路 (RNN)", desc: "處理序列資料的記憶型網路", icon: "🔁" },
  { id: 12, title: "實戰專案：手寫數字辨識", desc: "綜合運用所有知識完成一個真實專案", icon: "✍️" },
];

const features = [
  {
    title: "漸進式教學",
    desc: "從最基礎的概念開始，逐步深入到完整的神經網路實作，每一步都有清晰的解說",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "互動式沙盒",
    desc: "即時視覺化神經元之間的訊號傳導過程，親眼看到每個權重和偏差如何影響輸出",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "實作編程",
    desc: "內建程式碼編輯器，跟著教學一步步寫出你自己的神經網路，即時看到執行結果",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="page-transition">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[var(--primary-light)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
                從零開始
              </span>
              <br />
              理解神經網路
            </h1>
            <p className="text-lg md:text-xl text-[var(--foreground)]/70 mb-8 leading-relaxed">
              透過互動式視覺化與實作編程，深入理解深度學習的核心概念。
              <br />
              不只是讀理論——親手建構你的第一個神經網路。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tutorials/chapter/1"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                開始學習
              </Link>
              <Link
                href="/sandbox"
                className="px-8 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-light)] transition-colors"
              >
                體驗沙盒
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 text-[var(--primary-light)] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course outline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">課程大綱</h2>
        <p className="text-center text-[var(--foreground)]/60 mb-12 max-w-2xl mx-auto">
          12 個章節帶你從零基礎到能獨立建構神經網路
        </p>
        <div className="max-w-3xl mx-auto space-y-4">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/tutorials/chapter/${ch.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-lg shrink-0">
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-[var(--primary-light)] transition-colors">
                  第 {ch.id} 章：{ch.title}
                </h3>
                <p className="text-sm text-[var(--foreground)]/50">{ch.desc}</p>
              </div>
              <svg className="w-5 h-5 text-[var(--foreground)]/30 group-hover:text-[var(--primary-light)] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[var(--foreground)]/40">
          NeuralLab — 互動式神經網路學習平台
        </div>
      </footer>
    </div>
  );
}
