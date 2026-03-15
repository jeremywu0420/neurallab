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
    name: "Softmax 多分類",
    desc: "實作 Softmax 函數與交叉熵損失",
    code: `// Softmax 多分類 — 手寫數字辨識的基礎

function softmax(logits) {
  const maxVal = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function crossEntropy(probs, target) {
  return -Math.log(probs[target] + 1e-8);
}

// 模擬 3 類分類問題
const classes = ["貓", "狗", "鳥"];

// 模型輸出的原始分數 (logits)
const logits1 = [2.1, 0.5, -1.2];
const logits2 = [0.3, 2.8, 0.1];
const logits3 = [-0.5, 0.2, 3.5];

console.log("=== Softmax 分類範例 ===\\n");

[logits1, logits2, logits3].forEach((logits, i) => {
  const probs = softmax(logits);
  const predicted = probs.indexOf(Math.max(...probs));

  console.log(\`樣本 \${i + 1}:\`);
  console.log(\`  原始分數: [\${logits.map(l => l.toFixed(2)).join(", ")}]\`);
  console.log(\`  Softmax:  [\${probs.map(p => (p * 100).toFixed(1) + "%").join(", ")}]\`);
  console.log(\`  預測: \${classes[predicted]} (信心: \${(probs[predicted] * 100).toFixed(1)}%)\`);

  // 假設真實標籤就是 i
  const loss = crossEntropy(probs, i);
  console.log(\`  交叉熵損失: \${loss.toFixed(4)}\\n\`);
});

console.log("觀察：");
console.log("- Softmax 將任意實數轉換為機率分佈（總和 = 1）");
console.log("- 較大的 logit 對應較高的機率");
console.log("- 交叉熵損失：預測越準確，損失越小");`,
  },
  {
    name: "Mini-Batch SGD",
    desc: "比較不同批次大小對訓練的影響",
    code: `// Mini-Batch SGD vs 全批次 vs 隨機梯度下降

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

// 生成線性可分資料
function genData(n) {
  const X = [], Y = [];
  for (let i = 0; i < n; i++) {
    const x1 = Math.random() * 4 - 2;
    const x2 = Math.random() * 4 - 2;
    Y.push(x1 + x2 > 0.5 ? 1 : 0);
    X.push([x1, x2]);
  }
  return { X, Y };
}

function trainEpoch(X, Y, w, b, lr, batchSize) {
  let totalLoss = 0;
  const indices = Array.from({ length: X.length }, (_, i) => i);

  // Shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let start = 0; start < X.length; start += batchSize) {
    const end = Math.min(start + batchSize, X.length);
    let dw = [0, 0], db = 0;

    for (let i = start; i < end; i++) {
      const idx = indices[i];
      const z = w[0] * X[idx][0] + w[1] * X[idx][1] + b;
      const a = sigmoid(z);
      const err = a - Y[idx];
      totalLoss += -(Y[idx] * Math.log(a + 1e-8) + (1 - Y[idx]) * Math.log(1 - a + 1e-8));

      dw[0] += err * X[idx][0];
      dw[1] += err * X[idx][1];
      db += err;
    }

    const m = end - start;
    w[0] -= lr * dw[0] / m;
    w[1] -= lr * dw[1] / m;
    b -= lr * db / m;
  }

  return totalLoss / X.length;
}

const { X, Y } = genData(200);
const epochs = 30;
const configs = [
  { name: "SGD (batch=1)", batch: 1, lr: 0.1 },
  { name: "Mini-Batch (batch=32)", batch: 32, lr: 0.3 },
  { name: "Full-Batch (batch=200)", batch: 200, lr: 0.5 },
];

console.log("=== 批次大小對訓練的影響 ===\\n");

for (const cfg of configs) {
  let w = [0.1, -0.1], b = 0;
  console.log(\`--- \${cfg.name} ---\`);

  for (let e = 0; e < epochs; e++) {
    const loss = trainEpoch(X, Y, w, b, cfg.lr, cfg.batch);
    if (e % 5 === 0 || e === epochs - 1) {
      console.log(\`  Epoch \${e}: Loss = \${loss.toFixed(4)}\`);
    }
  }

  // Accuracy
  let correct = 0;
  for (let i = 0; i < X.length; i++) {
    const pred = sigmoid(w[0]*X[i][0] + w[1]*X[i][1] + b) >= 0.5 ? 1 : 0;
    if (pred === Y[i]) correct++;
  }
  console.log(\`  最終準確率: \${(correct/X.length*100).toFixed(1)}%\\n\`);
}

console.log("觀察：");
console.log("- SGD (batch=1): 更新頻繁但震盪大");
console.log("- Mini-Batch: 平衡了速度與穩定性");
console.log("- Full-Batch: 穩定但每步計算量大");`,
  },
  {
    name: "Adam 優化器",
    desc: "實作並比較 Adam、Momentum、SGD",
    code: `// 比較三種優化器：SGD vs Momentum vs Adam

function loss(x, y) {
  // Rosenbrock-like function (有狹長谷地)
  return (1 - x) ** 2 + 10 * (y - x * x) ** 2;
}

function grad(x, y) {
  return [
    -2 * (1 - x) - 40 * x * (y - x * x),
    20 * (y - x * x),
  ];
}

// SGD
function sgd(lr, steps) {
  let x = -1.5, y = 2;
  const history = [];
  for (let t = 0; t < steps; t++) {
    const [gx, gy] = grad(x, y);
    x -= lr * gx;
    y -= lr * gy;
    if (t % 50 === 0) history.push({ t, x, y, loss: loss(x, y) });
  }
  return history;
}

// Momentum
function momentum(lr, beta, steps) {
  let x = -1.5, y = 2;
  let vx = 0, vy = 0;
  const history = [];
  for (let t = 0; t < steps; t++) {
    const [gx, gy] = grad(x, y);
    vx = beta * vx + gx;
    vy = beta * vy + gy;
    x -= lr * vx;
    y -= lr * vy;
    if (t % 50 === 0) history.push({ t, x, y, loss: loss(x, y) });
  }
  return history;
}

// Adam
function adam(lr, steps) {
  let x = -1.5, y = 2;
  let mx = 0, my = 0, vx = 0, vy = 0;
  const b1 = 0.9, b2 = 0.999, eps = 1e-8;
  const history = [];
  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = grad(x, y);

    mx = b1 * mx + (1 - b1) * gx;
    my = b1 * my + (1 - b1) * gy;
    vx = b2 * vx + (1 - b2) * gx * gx;
    vy = b2 * vy + (1 - b2) * gy * gy;

    const mxh = mx / (1 - b1 ** t);
    const myh = my / (1 - b1 ** t);
    const vxh = vx / (1 - b2 ** t);
    const vyh = vy / (1 - b2 ** t);

    x -= lr * mxh / (Math.sqrt(vxh) + eps);
    y -= lr * myh / (Math.sqrt(vyh) + eps);

    if ((t - 1) % 50 === 0) history.push({ t, x, y, loss: loss(x, y) });
  }
  return history;
}

const steps = 500;
console.log("=== 優化器比較（Rosenbrock 函數）===");
console.log("最佳解: (1, 1), Loss = 0\\n");

const results = {
  "SGD (lr=0.001)": sgd(0.001, steps),
  "Momentum (lr=0.001, β=0.9)": momentum(0.001, 0.9, steps),
  "Adam (lr=0.01)": adam(0.01, steps),
};

for (const [name, history] of Object.entries(results)) {
  console.log(\`--- \${name} ---\`);
  for (const h of history) {
    console.log(\`  Step \${h.t}: (\${h.x.toFixed(4)}, \${h.y.toFixed(4)}) Loss = \${h.loss.toFixed(4)}\`);
  }
  const last = history[history.length - 1];
  console.log(\`  最終 Loss: \${last.loss.toFixed(6)}\\n\`);
}

console.log("觀察：");
console.log("- SGD 在狹長谷地中緩慢震盪");
console.log("- Momentum 利用慣性加速收斂");
console.log("- Adam 結合動量和自適應學習率，通常最快收斂");`,
  },
  {
    name: "Dropout 正則化",
    desc: "觀察 Dropout 如何防止過擬合",
    code: `// Dropout 正則化 — 防止過擬合的關鍵技術

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

class SimpleNet {
  constructor(hiddenSize, useDropout = false, dropRate = 0.5) {
    this.hiddenSize = hiddenSize;
    this.useDropout = useDropout;
    this.dropRate = dropRate;

    // Xavier init
    const s1 = Math.sqrt(2 / (1 + hiddenSize));
    const s2 = Math.sqrt(2 / (hiddenSize + 1));
    this.w1 = Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * s1);
    this.b1 = new Array(hiddenSize).fill(0);
    this.w2 = Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * s2);
    this.b2 = 0;
  }

  forward(x, training = false) {
    this.h = [];
    this.mask = [];

    for (let j = 0; j < this.hiddenSize; j++) {
      let a = sigmoid(x * this.w1[j] + this.b1[j]);

      // Dropout: 訓練時隨機關閉神經元
      if (this.useDropout && training) {
        const keep = Math.random() > this.dropRate ? 1 : 0;
        this.mask.push(keep);
        a = a * keep / (1 - this.dropRate); // Inverted dropout
      } else {
        this.mask.push(1);
      }

      this.h.push(a);
    }

    let out = this.b2;
    for (let j = 0; j < this.hiddenSize; j++) {
      out += this.h[j] * this.w2[j];
    }
    return out;
  }

  train(X, Y, lr, epochs) {
    const trainLosses = [];
    const testLosses = [];

    // Split: 70% train, 30% test
    const split = Math.floor(X.length * 0.7);
    const Xtrain = X.slice(0, split), Ytrain = Y.slice(0, split);
    const Xtest = X.slice(split), Ytest = Y.slice(split);

    for (let e = 0; e < epochs; e++) {
      // Train
      let trainLoss = 0;
      for (let i = 0; i < Xtrain.length; i++) {
        const pred = this.forward(Xtrain[i], true);
        const err = pred - Ytrain[i];
        trainLoss += err * err;

        // Backprop (simplified single-input network)
        const dout = 2 * err / Xtrain.length;
        for (let j = 0; j < this.hiddenSize; j++) {
          const dh = dout * this.w2[j] * this.mask[j];
          const da = dh * this.h[j] * (1 - this.h[j]) * (this.mask[j] ? 1/(1-this.dropRate) : 0);
          this.w2[j] -= lr * dout * this.h[j];
          this.w1[j] -= lr * da * Xtrain[i];
          this.b1[j] -= lr * da;
        }
        this.b2 -= lr * dout;
      }

      // Test (no dropout)
      let testLoss = 0;
      for (let i = 0; i < Xtest.length; i++) {
        const pred = this.forward(Xtest[i], false);
        testLoss += (pred - Ytest[i]) ** 2;
      }

      if (e % 20 === 0) {
        trainLosses.push(trainLoss / Xtrain.length);
        testLosses.push(testLoss / Xtest.length);
      }
    }

    return { trainLosses, testLosses };
  }
}

// 生成帶有噪音的正弦波資料
const X = [], Y = [];
for (let i = 0; i < 100; i++) {
  const x = (i / 100) * 4 * Math.PI;
  X.push(x);
  Y.push(Math.sin(x) + (Math.random() - 0.5) * 0.5);
}

console.log("=== Dropout 正則化實驗 ===\\n");

// 大網路無 Dropout（容易過擬合）
const net1 = new SimpleNet(20, false);
const r1 = net1.train(X, Y, 0.01, 200);

// 大網路有 Dropout
const net2 = new SimpleNet(20, true, 0.3);
const r2 = net2.train(X, Y, 0.01, 200);

console.log("--- 無 Dropout (20 hidden neurons) ---");
r1.trainLosses.forEach((l, i) => {
  console.log(\`  Epoch \${i*20}: Train=\${l.toFixed(4)}, Test=\${r1.testLosses[i].toFixed(4)} \${r1.testLosses[i] > l * 1.5 ? "⚠️ 過擬合!" : ""}\`);
});

console.log("\\n--- 有 Dropout (rate=0.3) ---");
r2.trainLosses.forEach((l, i) => {
  console.log(\`  Epoch \${i*20}: Train=\${l.toFixed(4)}, Test=\${r2.testLosses[i].toFixed(4)}\`);
});

console.log("\\n觀察：");
console.log("- 無 Dropout: 訓練損失低但測試損失高 → 過擬合");
console.log("- 有 Dropout: 訓練時隨機關閉神經元，迫使網路學到更穩健的特徵");
console.log("- Dropout 相當於同時訓練多個子網路的集成");`,
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
