export interface TutorialSection {
  type: "text" | "code" | "math" | "interactive" | "quiz";
  content: string;
  language?: string;
  explanation?: string;
}

export interface Tutorial {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  sections: TutorialSection[];
  prevChapter?: number;
  nextChapter?: number;
}

export const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "什麼是神經網路？",
    subtitle: "從生物神經元到人工神經元的基礎概念",
    icon: "🧠",
    sections: [
      {
        type: "text",
        content: `## 生物神經元

我們的大腦由大約 **860 億個神經元** 組成。每個神經元都是一個微小的處理單元，透過 **樹突（dendrites）** 接收來自其他神經元的訊號，在 **細胞體（soma）** 中處理這些訊號，然後透過 **軸突（axon）** 將結果傳遞給下一個神經元。

當一個神經元接收到足夠強的訊號時，它就會「激發」（fire），將訊號傳遞下去。這個過程稱為 **突觸傳導**。`,
      },
      {
        type: "text",
        content: `## 從生物到人工

人工神經元模仿了這個過程：

1. **輸入（Inputs）**：對應樹突，接收數值資料
2. **權重（Weights）**：每個輸入都有一個對應的權重，代表該輸入的重要程度
3. **加權求和**：將所有「輸入 × 權重」加總起來
4. **偏差（Bias）**：加上一個偏差值，調整神經元的激發門檻
5. **激活函數（Activation Function）**：決定神經元是否應該「激發」

簡單來說：

\`output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)\``,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 一個最簡單的人工神經元
function neuron(inputs, weights, bias) {
  // 步驟 1: 加權求和
  let sum = 0;
  for (let i = 0; i < inputs.length; i++) {
    sum += inputs[i] * weights[i];
  }
  sum += bias;

  // 步驟 2: 激活函數（這裡用簡單的階梯函數）
  return sum >= 0 ? 1 : 0;
}

// 試試看！
const inputs = [1.0, 0.5];     // 兩個輸入
const weights = [0.7, -0.3];   // 對應的權重
const bias = -0.2;             // 偏差

const output = neuron(inputs, weights, bias);
console.log("輸入:", inputs);
console.log("權重:", weights);
console.log("偏差:", bias);
console.log("加權求和:", inputs[0]*weights[0] + inputs[1]*weights[1] + bias);
console.log("輸出:", output);`,
        explanation: "這段程式碼實作了最基本的人工神經元。它接收輸入值，乘以對應的權重，加上偏差，然後通過一個簡單的激活函數（如果結果 ≥ 0 就輸出 1，否則輸出 0）。你可以修改輸入、權重和偏差來看看輸出如何變化。",
      },
      {
        type: "text",
        content: `## 神經網路的結構

單一神經元能做的事情很有限。但當我們將多個神經元 **分層排列** 並連接起來，就形成了神經網路：

- **輸入層（Input Layer）**：接收原始資料
- **隱藏層（Hidden Layers）**：在中間進行複雜的運算，可以有多層
- **輸出層（Output Layer）**：產生最終結果

每一層的每個神經元都與下一層的所有神經元相連，這種結構稱為 **全連接層（Fully Connected Layer）**。

前往沙盒可以親眼看到訊號如何在這些層之間流動！`,
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "在人工神經元中，「權重」的作用是什麼？",
          options: [
            "決定神經元的顏色",
            "代表每個輸入的重要程度",
            "限制輸入的數量",
            "設定神經網路的層數",
          ],
          correct: 1,
          explanation: "權重（weights）代表了每個輸入對神經元輸出的重要程度。較大的權重意味著該輸入對結果的影響更大，而較小或負的權重意味著影響較小或有抑制作用。",
        }),
      },
    ],
    nextChapter: 2,
  },
  {
    id: 2,
    title: "感知器與線性分類",
    subtitle: "理解最簡單的神經網路單元",
    icon: "⚡",
    sections: [
      {
        type: "text",
        content: `## 感知器（Perceptron）

感知器是最簡單的神經網路形式，由 Frank Rosenblatt 在 1957 年提出。它只有一個神經元，但已經能夠做一些有趣的事情——**線性分類**。

感知器的工作流程：
1. 接收多個輸入 x₁, x₂, ..., xₙ
2. 每個輸入乘以對應的權重 w₁, w₂, ..., wₙ
3. 將結果加總，再加上偏差 b
4. 如果總和 ≥ 0，輸出 1；否則輸出 0`,
      },
      {
        type: "text",
        content: `## 線性分類

想像你有一堆資料點在二維平面上，分成兩類（紅色和藍色）。感知器的任務就是找到一條 **直線**，把這兩類分開。

這條線的方程式就是：
\`w₁x₁ + w₂x₂ + b = 0\`

- 線的一側：w₁x₁ + w₂x₂ + b > 0 → 分類為 1
- 線的另一側：w₁x₁ + w₂x₂ + b < 0 → 分類為 0

**限制**：感知器只能解決「線性可分」的問題。像 XOR 這種無法用一條直線分開的問題，單一感知器就無法解決。這也是為什麼我們需要多層神經網路！`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 感知器學習演算法
class Perceptron {
  constructor(inputSize, learningRate = 0.1) {
    // 隨機初始化權重
    this.weights = Array.from(
      { length: inputSize },
      () => Math.random() * 2 - 1
    );
    this.bias = Math.random() * 2 - 1;
    this.lr = learningRate;
  }

  // 預測
  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum >= 0 ? 1 : 0;
  }

  // 訓練一筆資料
  train(inputs, target) {
    const prediction = this.predict(inputs);
    const error = target - prediction;

    // 更新權重和偏差
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.lr * error * inputs[i];
    }
    this.bias += this.lr * error;

    return error;
  }
}

// 訓練感知器學習 AND 邏輯閘
const p = new Perceptron(2);
const trainingData = [
  { inputs: [0, 0], target: 0 },
  { inputs: [0, 1], target: 0 },
  { inputs: [1, 0], target: 0 },
  { inputs: [1, 1], target: 1 },
];

// 訓練 100 輪
for (let epoch = 0; epoch < 100; epoch++) {
  for (const data of trainingData) {
    p.train(data.inputs, data.target);
  }
}

// 測試結果
console.log("AND 邏輯閘學習結果：");
for (const data of trainingData) {
  console.log(
    \`輸入: [\${data.inputs}] → 預測: \${p.predict(data.inputs)} (正確答案: \${data.target})\`
  );
}
console.log("\\n學到的權重:", p.weights.map(w => w.toFixed(3)));
console.log("學到的偏差:", p.bias.toFixed(3));`,
        explanation: "這個感知器會自動學習 AND 邏輯閘的行為。透過不斷地根據錯誤調整權重和偏差，它最終能正確地分類所有輸入。試著把訓練資料改成 OR 邏輯閘看看！",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼單一感知器無法解決 XOR 問題？",
          options: [
            "因為 XOR 的輸入太多",
            "因為 XOR 的資料無法用一條直線分開",
            "因為感知器的學習率太低",
            "因為 XOR 需要更多的訓練資料",
          ],
          correct: 1,
          explanation: "XOR 問題的資料點在二維空間中是「線性不可分」的——你無法畫出一條直線來將輸出為 0 和輸出為 1 的點分開。這正是感知器的根本限制，也是促使研究者開發多層神經網路的重要原因。",
        }),
      },
    ],
    prevChapter: 1,
    nextChapter: 3,
  },
  {
    id: 3,
    title: "激活函數",
    subtitle: "Sigmoid、ReLU、Tanh 的原理與視覺化",
    icon: "📈",
    sections: [
      {
        type: "text",
        content: `## 為什麼需要激活函數？

如果神經網路中沒有激活函數，不管有多少層，整個網路都只能做 **線性變換**。多個線性變換的組合還是線性變換！

激活函數引入了 **非線性**，讓神經網路能夠學習複雜的模式。

常見的激活函數有：`,
      },
      {
        type: "text",
        content: `## Sigmoid 函數

\`σ(x) = 1 / (1 + e^(-x))\`

- 輸出範圍：(0, 1)
- 優點：輸出可以解釋為機率
- 缺點：在極端值時梯度接近 0（**梯度消失問題**）

## ReLU（Rectified Linear Unit）

\`ReLU(x) = max(0, x)\`

- 輸出範圍：[0, +∞)
- 優點：計算簡單、不容易梯度消失
- 缺點：負值時梯度為 0（**死亡 ReLU 問題**）

## Tanh（雙曲正切）

\`tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))\`

- 輸出範圍：(-1, 1)
- 優點：輸出以 0 為中心
- 缺點：同樣有梯度消失問題`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 三種常見的激活函數
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function relu(x) {
  return Math.max(0, x);
}

function tanh(x) {
  return Math.tanh(x);
}

// 以及它們的導數（反向傳播時需要）
function sigmoidDerivative(x) {
  const s = sigmoid(x);
  return s * (1 - s);
}

function reluDerivative(x) {
  return x > 0 ? 1 : 0;
}

function tanhDerivative(x) {
  const t = tanh(x);
  return 1 - t * t;
}

// 測試不同輸入值
const testValues = [-3, -1, 0, 1, 3];
console.log("x\\t| Sigmoid\\t| ReLU\\t\\t| Tanh");
console.log("-".repeat(55));
for (const x of testValues) {
  console.log(
    \`\${x}\\t| \${sigmoid(x).toFixed(4)}\\t\\t| \${relu(x).toFixed(4)}\\t\\t| \${tanh(x).toFixed(4)}\`
  );
}

console.log("\\n導數值：");
console.log("x\\t| Sigmoid'\\t| ReLU'\\t\\t| Tanh'");
console.log("-".repeat(55));
for (const x of testValues) {
  console.log(
    \`\${x}\\t| \${sigmoidDerivative(x).toFixed(4)}\\t\\t| \${reluDerivative(x).toFixed(4)}\\t\\t| \${tanhDerivative(x).toFixed(4)}\`
  );
}`,
        explanation: "這段程式碼實作了三種常見的激活函數及其導數。注意觀察：Sigmoid 和 Tanh 在 x 的絕對值很大時，導數接近 0（梯度消失），而 ReLU 在正值區域的導數恆為 1，不會消失。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼 ReLU 是目前最常用的激活函數？",
          options: [
            "因為它的輸出範圍是 (0, 1)",
            "因為它計算簡單且不容易梯度消失",
            "因為它沒有任何缺點",
            "因為它的輸出以 0 為中心",
          ],
          correct: 1,
          explanation: "ReLU 之所以受歡迎，主要是因為：(1) 計算非常簡單，只是 max(0, x)；(2) 在正值區域梯度恆為 1，不會出現梯度消失問題。雖然它有「死亡 ReLU」的缺點，但在大多數情況下效果很好。",
        }),
      },
    ],
    prevChapter: 2,
    nextChapter: 4,
  },
  {
    id: 4,
    title: "前向傳播",
    subtitle: "資料如何在網路中流動",
    icon: "➡️",
    sections: [
      {
        type: "text",
        content: `## 什麼是前向傳播？

**前向傳播（Forward Propagation）** 是指資料從輸入層，經過一層一層的隱藏層，最終到達輸出層的過程。

在每一層，資料都會經過以下步驟：
1. **線性變換**：z = W · x + b（矩陣乘法 + 偏差）
2. **激活函數**：a = f(z)（將結果通過非線性函數）

其中 W 是權重矩陣，x 是輸入向量，b 是偏差向量，f 是激活函數。`,
      },
      {
        type: "text",
        content: `## 逐層計算

假設我們有一個 2-3-1 的網路（2 個輸入、3 個隱藏神經元、1 個輸出）：

**第一層（輸入 → 隱藏）：**
\`z₁ = W₁ · x + b₁\`  （3×2 矩陣 × 2×1 向量 + 3×1 偏差 = 3×1 向量）
\`a₁ = ReLU(z₁)\`

**第二層（隱藏 → 輸出）：**
\`z₂ = W₂ · a₁ + b₂\`  （1×3 矩陣 × 3×1 向量 + 1×1 偏差 = 1×1 向量）
\`a₂ = Sigmoid(z₂)\`  （輸出一個 0~1 的值）

前往沙盒可以視覺化看到每個值如何傳遞！`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 實作前向傳播
class NeuralNetwork {
  constructor(layers) {
    // layers 例如 [2, 3, 1] 代表 2個輸入、3個隱藏、1個輸出
    this.weights = [];
    this.biases = [];

    for (let i = 0; i < layers.length - 1; i++) {
      // 隨機初始化權重（Xavier 初始化）
      const scale = Math.sqrt(2 / (layers[i] + layers[i + 1]));
      this.weights.push(
        Array.from({ length: layers[i + 1] }, () =>
          Array.from({ length: layers[i] }, () => (Math.random() * 2 - 1) * scale)
        )
      );
      this.biases.push(
        Array.from({ length: layers[i + 1] }, () => 0)
      );
    }
  }

  // 激活函數
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  relu(x) { return Math.max(0, x); }

  // 前向傳播
  forward(input) {
    let current = input;
    const activations = [input]; // 記錄每層的輸出

    for (let layer = 0; layer < this.weights.length; layer++) {
      const W = this.weights[layer];
      const b = this.biases[layer];
      const next = [];

      for (let j = 0; j < W.length; j++) {
        let sum = b[j];
        for (let i = 0; i < current.length; i++) {
          sum += W[j][i] * current[i];
        }
        // 最後一層用 sigmoid，其他用 relu
        const isLastLayer = layer === this.weights.length - 1;
        next.push(isLastLayer ? this.sigmoid(sum) : this.relu(sum));
      }

      current = next;
      activations.push(current);
    }

    return { output: current, activations };
  }
}

// 建立 2-3-1 的網路
const nn = new NeuralNetwork([2, 3, 1]);

// 前向傳播
const input = [1.0, 0.5];
const result = nn.forward(input);

console.log("輸入:", input);
console.log("\\n逐層輸出：");
result.activations.forEach((act, i) => {
  const label = i === 0 ? "輸入層" :
    i === result.activations.length - 1 ? "輸出層" : \`隱藏層 \${i}\`;
  console.log(\`  \${label}: [\${act.map(v => v.toFixed(4)).join(", ")}]\`);
});
console.log("\\n最終輸出:", result.output[0].toFixed(4));`,
        explanation: "這段程式碼實作了一個可以自訂層數和神經元數量的前向傳播網路。注意看每一層的輸出如何作為下一層的輸入。使用 Xavier 初始化讓初始權重更合理。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "前向傳播中，每一層的計算順序是什麼？",
          options: [
            "激活函數 → 線性變換",
            "線性變換 → 激活函數",
            "只有線性變換",
            "只有激活函數",
          ],
          correct: 1,
          explanation: "在前向傳播中，每一層都是先進行線性變換（z = W·x + b），然後再通過激活函數（a = f(z)）。這個順序很重要，因為線性變換決定了加權組合，而激活函數引入了非線性。",
        }),
      },
    ],
    prevChapter: 3,
    nextChapter: 5,
  },
  {
    id: 5,
    title: "損失函數與優化",
    subtitle: "衡量模型的好壞並改進它",
    icon: "🎯",
    sections: [
      {
        type: "text",
        content: `## 損失函數

訓練神經網路的目標是讓輸出盡可能接近正確答案。**損失函數（Loss Function）** 就是用來衡量「模型的預測與正確答案之間的差距」。

損失越小，代表模型越好。

### 常見的損失函數

**均方誤差（MSE）** — 用於迴歸問題：
\`MSE = (1/n) Σ (yᵢ - ŷᵢ)²\`

**二元交叉熵（Binary Cross-Entropy）** — 用於二分類問題：
\`BCE = -(1/n) Σ [yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]\``,
      },
      {
        type: "text",
        content: `## 梯度下降（Gradient Descent）

知道了損失有多大，接下來要想辦法減少它。這就是 **優化（Optimization）** 的目標。

最基本的優化方法是 **梯度下降**：

1. 計算損失函數相對於每個權重的 **梯度**（偏導數）
2. 將權重沿著梯度的 **反方向** 更新

\`w_new = w_old - learning_rate × ∂Loss/∂w\`

- **學習率（Learning Rate）**：控制每次更新的步伐大小
  - 太大：可能跳過最佳點，甚至發散
  - 太小：收斂太慢，可能困在局部最小值`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 視覺化梯度下降的過程
// 假設損失函數是 L(w) = (w - 3)²（最小值在 w = 3）

function loss(w) {
  return (w - 3) ** 2;
}

function lossGradient(w) {
  return 2 * (w - 3);
}

// 梯度下降
function gradientDescent(startW, learningRate, steps) {
  let w = startW;
  const history = [{ step: 0, w, loss: loss(w) }];

  for (let i = 1; i <= steps; i++) {
    const grad = lossGradient(w);
    w = w - learningRate * grad;
    history.push({ step: i, w: parseFloat(w.toFixed(4)), loss: parseFloat(loss(w).toFixed(4)) });
  }
  return history;
}

// 用不同的學習率試試
console.log("=== 學習率 = 0.1（適中）===");
const h1 = gradientDescent(10, 0.1, 10);
h1.forEach(h => console.log(\`  步驟 \${h.step}: w = \${h.w.toFixed(4)}, Loss = \${h.loss.toFixed(4)}\`));

console.log("\\n=== 學習率 = 0.01（太小）===");
const h2 = gradientDescent(10, 0.01, 10);
h2.forEach(h => console.log(\`  步驟 \${h.step}: w = \${h.w.toFixed(4)}, Loss = \${h.loss.toFixed(4)}\`));

console.log("\\n=== 學習率 = 0.9（太大）===");
const h3 = gradientDescent(10, 0.9, 10);
h3.forEach(h => console.log(\`  步驟 \${h.step}: w = \${h.w.toFixed(4)}, Loss = \${h.loss.toFixed(4)}\`));

console.log("\\n觀察：適中的學習率能穩定地找到最小值 w=3");`,
        explanation: "這個範例展示了梯度下降如何運作。觀察不同學習率的效果：0.1 穩定收斂，0.01 收斂很慢，0.9 則會震盪。找到合適的學習率是訓練神經網路的重要技巧。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "學習率太大會導致什麼問題？",
          options: [
            "收斂太慢",
            "每次更新計算量太大",
            "可能跳過最佳點，甚至不收斂",
            "記憶體不足",
          ],
          correct: 2,
          explanation: "學習率太大時，每次權重更新的幅度太大，可能會直接跳過損失函數的最小值，導致震盪甚至發散。就像走山路時步伐太大，可能會直接跳過山谷。",
        }),
      },
    ],
    prevChapter: 4,
    nextChapter: 6,
  },
  {
    id: 6,
    title: "反向傳播",
    subtitle: "神經網路如何學習——梯度下降的核心",
    icon: "🔄",
    sections: [
      {
        type: "text",
        content: `## 反向傳播的核心思想

**反向傳播（Backpropagation）** 是訓練神經網路的核心演算法。它的目的是有效率地計算損失函數相對於每個權重的梯度。

核心觀念：利用 **鏈式法則（Chain Rule）** 從輸出層反向逐層計算梯度。

假設我們有：
- 前向傳播：x → z = wx + b → a = σ(z) → Loss
- 我們想求：∂Loss/∂w 和 ∂Loss/∂b

用鏈式法則：
\`∂Loss/∂w = ∂Loss/∂a × ∂a/∂z × ∂z/∂w\``,
      },
      {
        type: "text",
        content: `## 逐步拆解

以一個簡單的例子（單一神經元，MSE 損失）：

**前向傳播：**
1. z = w·x + b
2. a = sigmoid(z)
3. Loss = (y - a)²

**反向傳播：**
1. ∂Loss/∂a = -2(y - a)
2. ∂a/∂z = sigmoid(z) × (1 - sigmoid(z))
3. ∂z/∂w = x
4. ∂z/∂b = 1

**組合起來：**
- ∂Loss/∂w = ∂Loss/∂a × ∂a/∂z × x
- ∂Loss/∂b = ∂Loss/∂a × ∂a/∂z × 1

在多層網路中，誤差信號從輸出層 **反向** 傳遞回每一層，每一層都使用前一層（更靠近輸出的層）傳來的梯度，再結合本層的局部梯度。`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 完整的反向傳播範例：訓練一個神經元
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function sigmoidDeriv(x) {
  const s = sigmoid(x);
  return s * (1 - s);
}

// 訓練資料：學習 NOT 邏輯（輸入 1 → 0, 輸入 0 → 1）
const data = [
  { x: [0], y: 1 },
  { x: [1], y: 0 },
];

let w = [Math.random() * 2 - 1]; // 權重
let b = Math.random() * 2 - 1;   // 偏差
const lr = 0.5;                    // 學習率

console.log("=== 反向傳播訓練過程 ===\\n");

for (let epoch = 0; epoch < 1000; epoch++) {
  let totalLoss = 0;

  for (const { x, y } of data) {
    // === 前向傳播 ===
    const z = w[0] * x[0] + b;
    const a = sigmoid(z);  // 預測值
    const loss = (y - a) ** 2;
    totalLoss += loss;

    // === 反向傳播 ===
    // 計算各層梯度
    const dLoss_da = -2 * (y - a);          // 損失對激活值的梯度
    const da_dz = sigmoidDeriv(z);           // 激活函數的梯度
    const dz_dw = x[0];                     // 線性函數對權重的梯度
    const dz_db = 1;                         // 線性函數對偏差的梯度

    // 鏈式法則
    const dLoss_dw = dLoss_da * da_dz * dz_dw;
    const dLoss_db = dLoss_da * da_dz * dz_db;

    // === 更新權重 ===
    w[0] -= lr * dLoss_dw;
    b -= lr * dLoss_db;
  }

  if (epoch % 200 === 0) {
    console.log(\`Epoch \${epoch}: Loss = \${(totalLoss / data.length).toFixed(6)}\`);
  }
}

// 測試
console.log("\\n=== 訓練結果 ===");
console.log(\`學到的權重: \${w[0].toFixed(4)}\`);
console.log(\`學到的偏差: \${b.toFixed(4)}\`);
console.log(\`\\n預測 NOT(0) = \${sigmoid(w[0] * 0 + b).toFixed(4)} (期望 ≈ 1)\`);
console.log(\`預測 NOT(1) = \${sigmoid(w[0] * 1 + b).toFixed(4)} (期望 ≈ 0)\`);`,
        explanation: "這段程式碼展示了反向傳播的完整過程：前向傳播計算預測值 → 計算損失 → 反向計算梯度 → 更新權重。注意觀察 Loss 如何隨著訓練逐漸下降，以及最終預測值如何接近正確答案。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "反向傳播使用了什麼數學技巧來計算梯度？",
          options: [
            "泰勒展開",
            "鏈式法則（Chain Rule）",
            "傅立葉變換",
            "矩陣分解",
          ],
          correct: 1,
          explanation: "反向傳播的核心是微積分中的鏈式法則（Chain Rule）。透過鏈式法則，我們可以將複雜的複合函數的導數分解為一系列簡單的局部導數相乘，從而有效率地計算出損失函數對每個權重的梯度。",
        }),
      },
    ],
    prevChapter: 5,
    nextChapter: 7,
  },
  {
    id: 7,
    title: "建構完整的神經網路",
    subtitle: "從零開始用程式碼建立你的第一個神經網路",
    icon: "🏗️",
    sections: [
      {
        type: "text",
        content: `## 把所有知識整合起來

恭喜你走到了最後一章！現在我們要把前六章學到的所有概念整合在一起，從零開始建構一個 **完整的多層神經網路**。

我們的目標是建立一個能解決 **XOR 問題** 的神經網路——這個問題是單一感知器無法解決的，需要至少一個隱藏層。

XOR 真值表：
- (0, 0) → 0
- (0, 1) → 1
- (1, 0) → 1
- (1, 1) → 0`,
      },
      {
        type: "text",
        content: `## 網路架構

我們將建立一個 **2-4-1** 的網路：
- **輸入層**：2 個神經元（兩個輸入值）
- **隱藏層**：4 個神經元（使用 ReLU 激活函數）
- **輸出層**：1 個神經元（使用 Sigmoid 激活函數）

完整流程：
1. 初始化權重和偏差
2. 前向傳播：計算每層的輸出
3. 計算損失：使用 MSE
4. 反向傳播：計算所有梯度
5. 更新權重：使用梯度下降
6. 重複步驟 2-5 直到收斂`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 完整的神經網路 - 從零開始！
class NeuralNetwork {
  constructor(layerSizes) {
    this.layers = layerSizes;
    this.weights = [];
    this.biases = [];

    // Xavier 初始化
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const scale = Math.sqrt(2 / (layerSizes[i] + layerSizes[i + 1]));
      this.weights.push(
        this.matrix(layerSizes[i + 1], layerSizes[i], () => (Math.random() * 2 - 1) * scale)
      );
      this.biases.push(new Array(layerSizes[i + 1]).fill(0));
    }
  }

  matrix(rows, cols, fn) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, fn)
    );
  }

  // 激活函數
  relu(x) { return Math.max(0, x); }
  reluDeriv(x) { return x > 0 ? 1 : 0; }
  sigmoid(x) { return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); }
  sigmoidDeriv(output) { return output * (1 - output); }

  // 前向傳播
  forward(input) {
    const zValues = [];  // 線性輸出
    const aValues = [input];  // 激活後的輸出

    let current = input;
    for (let l = 0; l < this.weights.length; l++) {
      const z = [];
      const a = [];
      const isLast = l === this.weights.length - 1;

      for (let j = 0; j < this.weights[l].length; j++) {
        let sum = this.biases[l][j];
        for (let i = 0; i < current.length; i++) {
          sum += this.weights[l][j][i] * current[i];
        }
        z.push(sum);
        a.push(isLast ? this.sigmoid(sum) : this.relu(sum));
      }

      zValues.push(z);
      aValues.push(a);
      current = a;
    }

    return { zValues, aValues, output: current };
  }

  // 反向傳播
  backward(target, { zValues, aValues }) {
    const numLayers = this.weights.length;
    const deltas = new Array(numLayers);

    // 輸出層的 delta
    const outputLayer = numLayers - 1;
    deltas[outputLayer] = aValues[numLayers].map((a, i) => {
      const error = a - target[i];
      return error * this.sigmoidDeriv(a);
    });

    // 隱藏層的 delta（反向）
    for (let l = numLayers - 2; l >= 0; l--) {
      deltas[l] = [];
      for (let j = 0; j < this.weights[l].length; j++) {
        let error = 0;
        for (let k = 0; k < this.weights[l + 1].length; k++) {
          error += deltas[l + 1][k] * this.weights[l + 1][k][j];
        }
        deltas[l].push(error * this.reluDeriv(zValues[l][j]));
      }
    }

    return deltas;
  }

  // 更新權重
  update(deltas, aValues, lr) {
    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.weights[l][j][i] -= lr * deltas[l][j] * aValues[l][i];
        }
        this.biases[l][j] -= lr * deltas[l][j];
      }
    }
  }

  // 訓練
  train(inputs, targets, lr = 0.1, epochs = 5000) {
    const losses = [];
    for (let e = 0; e < epochs; e++) {
      let totalLoss = 0;
      for (let i = 0; i < inputs.length; i++) {
        const fwd = this.forward(inputs[i]);
        const deltas = this.backward(targets[i], fwd);
        this.update(deltas, fwd.aValues, lr);
        totalLoss += targets[i].reduce(
          (sum, t, j) => sum + (t - fwd.output[j]) ** 2, 0
        );
      }
      if (e % 1000 === 0) losses.push({ epoch: e, loss: totalLoss / inputs.length });
    }
    return losses;
  }
}

// === 訓練 XOR ===
const nn = new NeuralNetwork([2, 4, 1]);

const inputs = [[0,0], [0,1], [1,0], [1,1]];
const targets = [[0], [1], [1], [0]];

console.log("🚀 開始訓練 XOR 神經網路...\\n");
const losses = nn.train(inputs, targets, 0.5, 5000);

console.log("訓練過程：");
losses.forEach(l => console.log(\`  Epoch \${l.epoch}: Loss = \${l.loss.toFixed(6)}\`));

console.log("\\n📊 最終結果：");
for (let i = 0; i < inputs.length; i++) {
  const { output } = nn.forward(inputs[i]);
  console.log(\`  XOR(\${inputs[i]}) = \${output[0].toFixed(4)} (期望: \${targets[i][0]})\`);
}

console.log("\\n✅ 恭喜！你已經從零建構了一個完整的神經網路！");`,
        explanation: "這是一個完整的神經網路實作，包含前向傳播、反向傳播和梯度下降。它能成功學習 XOR——一個單層感知器無法解決的問題。試試修改網路結構（例如改成 [2, 8, 1]）或調整學習率，觀察對訓練的影響！",
      },
      {
        type: "text",
        content: `## 你學到了什麼

回顧一下這七章的學習旅程：

1. **神經元的基本原理**：輸入 × 權重 + 偏差 → 激活函數
2. **感知器與線性分類**：最簡單的神經網路及其限制
3. **激活函數**：引入非線性讓網路能學習複雜模式
4. **前向傳播**：資料如何在網路中流動
5. **損失函數與優化**：衡量模型好壞並改進它
6. **反向傳播**：利用鏈式法則高效計算梯度
7. **完整實作**：把所有概念組合成可以運作的程式碼

接下來可以去 **沙盒** 中視覺化觀察神經網路的運作，或在 **程式實驗室** 中繼續實驗！`,
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼 XOR 問題需要隱藏層才能解決？",
          options: [
            "因為 XOR 有太多輸入",
            "因為 XOR 的資料在二維空間中是線性不可分的",
            "因為 XOR 的輸出有多個類別",
            "因為 XOR 需要更大的學習率",
          ],
          correct: 1,
          explanation: "XOR 的四個資料點（(0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0）在二維空間中無法用一條直線分開。隱藏層讓網路能夠學習非線性的決策邊界，這是解決 XOR 等線性不可分問題的關鍵。",
        }),
      },
    ],
    prevChapter: 6,
  },
];

export function getTutorial(id: number): Tutorial | undefined {
  return tutorials.find((t) => t.id === id);
}
