import Link from "next/link";
import { ProgressBadge } from "@/components/ChapterProgress";

const chapters = [
  { id: 1, title: "什麼是神經網路？", desc: "從生物神經元到人工神經元的基礎概念", icon: "🧠", topics: ["生物神經元", "人工神經元", "權重與偏差", "網路結構"] },
  { id: 2, title: "感知器與線性分類", desc: "理解最簡單的神經網路單元", icon: "⚡", topics: ["感知器", "線性分類", "學習演算法", "AND/OR 邏輯閘"] },
  { id: 3, title: "激活函數", desc: "Sigmoid、ReLU、Tanh 的原理與視覺化", icon: "📈", topics: ["Sigmoid", "ReLU", "Tanh", "非線性", "梯度消失"] },
  { id: 4, title: "前向傳播", desc: "資料如何在網路中流動", icon: "➡️", topics: ["矩陣運算", "逐層計算", "Xavier 初始化"] },
  { id: 5, title: "損失函數與優化", desc: "衡量模型的好壞並改進它", icon: "🎯", topics: ["MSE", "交叉熵", "梯度下降", "學習率"] },
  { id: 6, title: "反向傳播", desc: "神經網路如何學習——梯度下降的核心", icon: "🔄", topics: ["鏈式法則", "梯度計算", "權重更新"] },
  { id: 7, title: "建構完整的神經網路", desc: "從零開始用程式碼建立你的第一個神經網路", icon: "🏗️", topics: ["完整實作", "XOR 問題", "多層網路", "訓練與測試"] },
  { id: 8, title: "過擬合與正則化", desc: "讓模型真正「學會」而不是「背答案」", icon: "🛡️", topics: ["過擬合 vs 欠擬合", "Dropout", "L2 正則化", "早停法", "資料分割"] },
  { id: 9, title: "進階優化器", desc: "比基本梯度下降更聰明的訓練方法", icon: "🚀", topics: ["Momentum", "RMSprop", "Adam", "學習率排程", "批次訓練"] },
  { id: 10, title: "卷積神經網路 (CNN)", desc: "專為圖像設計的神經網路架構", icon: "🖼️", topics: ["卷積核", "特徵圖", "池化層", "圖像辨識", "參數共享"] },
  { id: 11, title: "循環神經網路 (RNN)", desc: "處理序列資料的記憶型網路", icon: "🔁", topics: ["序列建模", "隱藏狀態", "LSTM", "文字生成", "時間序列"] },
  { id: 12, title: "實戰專案：手寫數字辨識", desc: "綜合運用所有知識完成一個真實專案", icon: "✍️", topics: ["MNIST", "資料前處理", "模型設計", "訓練流程", "效能評估"] },
];

export default function TutorialsPage() {
  return (
    <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">教學課程</h1>
        <p className="text-[var(--foreground)]/60 text-lg">
          從零開始，12 個章節帶你完整理解並實作神經網路
        </p>
      </div>

      <div className="space-y-6">
        {chapters.map((ch, index) => (
          <Link
            key={ch.id}
            href={`/tutorials/chapter/${ch.id}`}
            className="block p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-2xl shrink-0">
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[var(--primary-light)]">
                    Chapter {ch.id}
                  </span>
                  {index === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                      從這裡開始
                    </span>
                  )}
                  <ProgressBadge chapterId={ch.id} />
                </div>
                <h2 className="text-xl font-semibold mb-1 group-hover:text-[var(--primary-light)] transition-colors">
                  {ch.title}
                </h2>
                <p className="text-sm text-[var(--foreground)]/50 mb-3">{ch.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {ch.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-1 rounded-md bg-[var(--surface-light)] text-[var(--foreground)]/60"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--foreground)]/20 group-hover:text-[var(--primary-light)] transition-colors shrink-0 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
