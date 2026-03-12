"use client";

import { useState } from "react";
import { CodeRunner } from "@/components/CodeRunner";

const templates = [
  {
    name: "單一神經元",
    desc: "最基本的人工神經元",
    code: `// 單一人工神經元
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function neuron(inputs, weights, bias) {
  let sum = bias;
  for (let i = 0; i < inputs.length; i++) {
    sum += inputs[i] * weights[i];
  }
  return sigmoid(sum);
}

// 試試不同的輸入和權重
const inputs = [1.0, 0.5, -0.3];
const weights = [0.7, -0.5, 0.3];
const bias = 0.1;

console.log("輸入:", inputs);
console.log("權重:", weights);
console.log("偏差:", bias);
console.log("輸出:", neuron(inputs, weights, bias).toFixed(4));`,
  },
  {
    name: "感知器學習",
    desc: "訓練感知器學習邏輯閘",
    code: `// 感知器學習 OR 邏輯閘
class Perceptron {
  constructor(n) {
    this.weights = Array.from({length: n}, () => Math.random() * 2 - 1);
    this.bias = Math.random() * 2 - 1;
  }

  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum >= 0 ? 1 : 0;
  }

  train(inputs, target, lr = 0.1) {
    const pred = this.predict(inputs);
    const error = target - pred;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += lr * error * inputs[i];
    }
    this.bias += lr * error;
  }
}

const p = new Perceptron(2);
const data = [
  { inputs: [0, 0], target: 0 },
  { inputs: [0, 1], target: 1 },
  { inputs: [1, 0], target: 1 },
  { inputs: [1, 1], target: 1 },
];

for (let epoch = 0; epoch < 100; epoch++) {
  for (const d of data) p.train(d.inputs, d.target);
}

console.log("OR 邏輯閘學習結果：");
for (const d of data) {
  console.log(\`  OR(\${d.inputs}) = \${p.predict(d.inputs)} (期望: \${d.target})\`);
}`,
  },
  {
    name: "激活函數比較",
    desc: "視覺化比較不同激活函數",
    code: `// 比較三種激活函數
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function relu(x) { return Math.max(0, x); }
function tanh_fn(x) { return Math.tanh(x); }

const values = [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4];

console.log("x\\t\\tSigmoid\\t\\tReLU\\t\\tTanh");
console.log("─".repeat(60));

for (const x of values) {
  console.log(
    \`\${x.toFixed(1)}\\t\\t\` +
    \`\${sigmoid(x).toFixed(4)}\\t\\t\` +
    \`\${relu(x).toFixed(4)}\\t\\t\` +
    \`\${tanh_fn(x).toFixed(4)}\`
  );
}

console.log("\\n觀察：");
console.log("- Sigmoid: 輸出範圍 (0, 1)，適合二分類");
console.log("- ReLU: 負值變 0，正值不變，計算最快");
console.log("- Tanh: 輸出範圍 (-1, 1)，以 0 為中心");`,
  },
  {
    name: "XOR 神經網路",
    desc: "解決 XOR 問題的完整神經網路",
    code: `// 完整神經網路：解決 XOR
class NeuralNetwork {
  constructor(sizes) {
    this.W = []; this.B = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      const s = Math.sqrt(2 / (sizes[i] + sizes[i+1]));
      this.W.push(Array.from({length: sizes[i+1]}, () =>
        Array.from({length: sizes[i]}, () => (Math.random()*2-1)*s)));
      this.B.push(new Array(sizes[i+1]).fill(0));
    }
  }

  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  relu(x) { return Math.max(0, x); }

  forward(x) {
    const zs = [], as = [x];
    let cur = x;
    for (let l = 0; l < this.W.length; l++) {
      const z = [], a = [];
      const last = l === this.W.length - 1;
      for (let j = 0; j < this.W[l].length; j++) {
        let s = this.B[l][j];
        for (let i = 0; i < cur.length; i++) s += this.W[l][j][i] * cur[i];
        z.push(s);
        a.push(last ? this.sigmoid(s) : this.relu(s));
      }
      zs.push(z); as.push(a); cur = a;
    }
    return { zs, as, out: cur };
  }

  train(X, Y, lr = 0.5, epochs = 5000) {
    for (let e = 0; e < epochs; e++) {
      let loss = 0;
      for (let n = 0; n < X.length; n++) {
        const { zs, as, out } = this.forward(X[n]);
        loss += (Y[n][0] - out[0]) ** 2;

        // Backprop
        const deltas = [];
        const L = this.W.length - 1;
        deltas[L] = as[L+1].map((a, i) => (a - Y[n][i]) * a * (1 - a));

        for (let l = L - 1; l >= 0; l--) {
          deltas[l] = [];
          for (let j = 0; j < this.W[l].length; j++) {
            let err = 0;
            for (let k = 0; k < this.W[l+1].length; k++)
              err += deltas[l+1][k] * this.W[l+1][k][j];
            deltas[l].push(err * (zs[l][j] > 0 ? 1 : 0));
          }
        }

        for (let l = 0; l < this.W.length; l++) {
          for (let j = 0; j < this.W[l].length; j++) {
            for (let i = 0; i < this.W[l][j].length; i++)
              this.W[l][j][i] -= lr * deltas[l][j] * as[l][i];
            this.B[l][j] -= lr * deltas[l][j];
          }
        }
      }

      if (e % 1000 === 0)
        console.log(\`Epoch \${e}: Loss = \${(loss / X.length).toFixed(6)}\`);
    }
  }
}

const nn = new NeuralNetwork([2, 4, 1]);
const X = [[0,0], [0,1], [1,0], [1,1]];
const Y = [[0], [1], [1], [0]];

console.log("開始訓練 XOR 神經網路...\\n");
nn.train(X, Y);

console.log("\\n結果：");
for (let i = 0; i < X.length; i++) {
  const { out } = nn.forward(X[i]);
  console.log(\`XOR(\${X[i]}) = \${out[0].toFixed(4)} (期望: \${Y[i][0]})\`);
}`,
  },
  {
    name: "梯度下降視覺化",
    desc: "觀察不同學習率對梯度下降的影響",
    code: `// 梯度下降：尋找 f(x) = (x-3)² + (y+1)² 的最小值
function loss(x, y) {
  return (x - 3) ** 2 + (y + 1) ** 2;
}

function gradX(x) { return 2 * (x - 3); }
function gradY(y) { return 2 * (y + 1); }

function optimize(lr, steps, label) {
  let x = 10, y = -8;
  console.log(\`\\n=== \${label} (lr=\${lr}) ===\`);
  console.log(\`起始點: (\${x}, \${y}), Loss = \${loss(x, y).toFixed(4)}\`);

  for (let i = 1; i <= steps; i++) {
    x -= lr * gradX(x);
    y -= lr * gradY(y);
    if (i <= 5 || i % 5 === 0) {
      console.log(\`  Step \${i}: (\${x.toFixed(4)}, \${y.toFixed(4)}), Loss = \${loss(x, y).toFixed(4)}\`);
    }
  }
  console.log(\`最終: (\${x.toFixed(4)}, \${y.toFixed(4)}), Loss = \${loss(x, y).toFixed(6)}\`);
  console.log(\`最佳解: (3, -1), Loss = 0\`);
}

optimize(0.1, 20, "適中學習率");
optimize(0.01, 20, "太小的學習率");
optimize(0.5, 20, "偏大的學習率");`,
  },
  {
    name: "自由編碼",
    desc: "從空白開始寫你自己的程式",
    code: `// 在這裡寫你自己的神經網路程式碼！
// 可以使用 console.log() 來輸出結果

console.log("Hello, Neural Network!");

// 提示：
// - 試著實作一個簡單的神經元
// - 或者修改上面的範例
// - 所有 JavaScript 語法都可以使用
`,
  },
];

export default function PlaygroundPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  return (
    <div className="page-transition max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">程式實驗室</h1>
        <p className="text-[var(--foreground)]/60">
          選擇範本或從空白開始，親手編寫神經網路程式碼並即時看到結果。
        </p>
      </div>

      {/* Template selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {templates.map((t, i) => (
          <button
            key={i}
            onClick={() => setSelectedTemplate(i)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedTemplate === i
                ? "bg-[var(--primary)]/20 text-[var(--primary-light)] border border-[var(--primary)]/30"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:border-[var(--primary)]/30"
            }`}
          >
            <span className="font-medium">{t.name}</span>
            <span className="hidden sm:inline text-xs ml-2 opacity-60">— {t.desc}</span>
          </button>
        ))}
      </div>

      {/* Code editor */}
      <CodeRunner
        key={selectedTemplate}
        initialCode={templates[selectedTemplate].code}
        explanation={templates[selectedTemplate].desc}
      />

      {/* Tips */}
      <div className="mt-8 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="font-semibold mb-3">使用提示</h3>
        <ul className="space-y-2 text-sm text-[var(--foreground)]/60">
          <li>- 使用 <code className="px-1 py-0.5 rounded bg-[var(--surface-light)] text-[var(--secondary)] font-mono text-xs">console.log()</code> 來輸出結果</li>
          <li>- 可以自由修改程式碼，點擊「重置」可以回到原始範本</li>
          <li>- 所有計算都在瀏覽器中執行，不需要安裝任何東西</li>
          <li>- 試著修改參數（學習率、網路結構等）來觀察不同的結果</li>
          <li>- 遇到問題可以回到教學課程複習相關概念</li>
        </ul>
      </div>
    </div>
  );
}
