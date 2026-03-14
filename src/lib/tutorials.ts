export interface CodeStep {
  title: string;
  code: string;
  explanation: string;
}

export interface CodingExercise {
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: { input: string; expected: string }[];
  hints: string[];
}

export interface TutorialSection {
  type: "text" | "code" | "math" | "interactive" | "quiz" | "code-step" | "coding-exercise";
  content: string;
  language?: string;
  explanation?: string;
  steps?: CodeStep[];
  exercise?: CodingExercise;
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
  // ============================================================
  // Chapter 1
  // ============================================================
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

當一個神經元接收到足夠強的訊號時，它就會「激發」（fire），將訊號傳遞下去。這個過程稱為 **突觸傳導**。

### 用生活化的比喻來理解

想像你在決定今天要不要帶傘出門。你會考慮很多因素：
- 天空看起來有多暗？（輸入 1）
- 天氣預報怎麼說？（輸入 2）
- 昨天有下雨嗎？（輸入 3）

每個因素對你的影響力不同——你可能更相信天氣預報（高權重），而比較不在意昨天的天氣（低權重）。最後你綜合所有因素做出「帶傘」或「不帶傘」的決定。這就是神經元的運作方式！`,
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

\`output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)\`

### 每個部分的直覺理解

- **權重就像「重要性旋鈕」**：權重越大，那個輸入越重要；權重為負數代表「抑制」效果
- **偏差就像「門檻調節器」**：偏差讓神經元更容易或更難被激發
- **激活函數就像「開關」**：決定是否要傳遞訊號`,
      },
      {
        type: "code-step",
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
const inputs = [1.0, 0.5];
const weights = [0.7, -0.3];
const bias = -0.2;

const output = neuron(inputs, weights, bias);
console.log("輸入:", inputs);
console.log("權重:", weights);
console.log("偏差:", bias);
console.log("加權求和:", inputs[0]*weights[0] + inputs[1]*weights[1] + bias);
console.log("輸出:", output);`,
        steps: [
          {
            title: "步驟一：定義函數簽名",
            code: "function neuron(inputs, weights, bias) {",
            explanation: "我們定義一個名為 neuron 的函數，接收三個參數：\n\n• inputs — 一個數字陣列，代表輸入值（例如感測器資料）\n• weights — 一個數字陣列，每個權重對應一個輸入，代表該輸入的重要程度\n• bias — 一個數字，用來調整神經元的激發門檻\n\n這三個參數就是人工神經元的核心組成。"
          },
          {
            title: "步驟二：加權求和",
            code: "  let sum = 0;\n  for (let i = 0; i < inputs.length; i++) {\n    sum += inputs[i] * weights[i];\n  }\n  sum += bias;",
            explanation: "這是神經元最核心的計算。我們遍歷每一個輸入，將它乘以對應的權重，然後全部加總起來。\n\n例如：如果 inputs = [1.0, 0.5]，weights = [0.7, -0.3]，bias = -0.2\n計算過程：\n  1.0 × 0.7 = 0.7\n  0.5 × (-0.3) = -0.15\n  加總 = 0.7 + (-0.15) + (-0.2) = 0.35\n\n注意第二個權重是負數，代表第二個輸入有「抑制」作用。最後加上偏差 -0.2，讓門檻稍微提高。"
          },
          {
            title: "步驟三：激活函數",
            code: "  return sum >= 0 ? 1 : 0;",
            explanation: "激活函數決定神經元是否「激發」。這裡我們使用最簡單的「階梯函數」（Step Function）：\n\n• 如果加權求和 ≥ 0，輸出 1（激發）\n• 如果加權求和 < 0，輸出 0（不激發）\n\n在我們的例子中，sum = 0.35 ≥ 0，所以輸出 1。\n\n這就像大腦中的神經元——訊號夠強就激發，不夠強就不傳遞。後面的章節會介紹更複雜的激活函數如 Sigmoid 和 ReLU。"
          },
          {
            title: "步驟四：測試神經元",
            code: "const inputs = [1.0, 0.5];\nconst weights = [0.7, -0.3];\nconst bias = -0.2;\n\nconst output = neuron(inputs, weights, bias);",
            explanation: "我們建立了一個有 2 個輸入的神經元：\n\n• 輸入 [1.0, 0.5]：第一個訊號強度為 1.0，第二個為 0.5\n• 權重 [0.7, -0.3]：第一個輸入很重要（0.7），第二個輸入有抑制效果（-0.3）\n• 偏差 -0.2：稍微提高了激發門檻\n\n試著修改這些值，觀察輸出如何變化！例如把偏差改成 -1.0，看看神經元是否還會激發。"
          }
        ],
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
      {
        type: "quiz",
        content: JSON.stringify({
          question: "如果一個神經元的加權求和結果為 -0.5，使用階梯函數（≥ 0 輸出 1，否則輸出 0），輸出是什麼？",
          options: [
            "1",
            "0",
            "-0.5",
            "0.5",
          ],
          correct: 1,
          explanation: "階梯函數的規則是：如果加權求和 ≥ 0 就輸出 1，否則輸出 0。因為 -0.5 < 0，所以輸出為 0。神經元沒有被激發。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "偏差（Bias）在神經元中扮演什麼角色？",
          options: [
            "增加輸入的數量",
            "調整神經元的激發門檻",
            "加快計算速度",
            "減少記憶體使用",
          ],
          correct: 1,
          explanation: "偏差（Bias）的作用是調整神經元的激發門檻。正的偏差讓神經元更容易被激發（更容易輸出 1），而負的偏差讓神經元更難被激發。它就像一個「預設傾向」。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：建立你自己的神經元",
          description: "請實作一個 myNeuron 函數，接收 inputs（陣列）、weights（陣列）和 bias（數字），回傳加權求和後通過階梯函數的結果。\n\n階梯函數規則：如果加權求和 >= 0，回傳 1；否則回傳 0。",
          starterCode: `// 請實作 myNeuron 函數
function myNeuron(inputs, weights, bias) {
  // TODO: 計算加權求和
  // TODO: 通過階梯函數並回傳結果
}

// 測試
console.log(myNeuron([1, 1], [0.5, 0.5], -0.5));
console.log(myNeuron([0, 1], [0.5, 0.5], -0.8));
console.log(myNeuron([1, 0, 1], [0.3, 0.3, 0.3], 0.1));`,
          solution: `function myNeuron(inputs, weights, bias) {
  let sum = 0;
  for (let i = 0; i < inputs.length; i++) {
    sum += inputs[i] * weights[i];
  }
  sum += bias;
  return sum >= 0 ? 1 : 0;
}

console.log(myNeuron([1, 1], [0.5, 0.5], -0.5));
console.log(myNeuron([0, 1], [0.5, 0.5], -0.8));
console.log(myNeuron([1, 0, 1], [0.3, 0.3, 0.3], 0.1));`,
          testCases: [
            { input: "console.log(myNeuron([1, 1], [0.5, 0.5], -0.5))", expected: "1" },
            { input: "console.log(myNeuron([0, 1], [0.5, 0.5], -0.8))", expected: "0" },
            { input: "console.log(myNeuron([1, 0, 1], [0.3, 0.3, 0.3], 0.1))", expected: "1" },
          ],
          hints: [
            "先用 for 迴圈將每個 inputs[i] * weights[i] 加總起來",
            "別忘了最後要加上 bias",
            "用三元運算子 sum >= 0 ? 1 : 0 來實作階梯函數",
          ],
        },
      },
      {
        type: "text",
        content: `## 神經網路的結構

單一神經元能做的事情很有限。但當我們將多個神經元 **分層排列** 並連接起來，就形成了神經網路：

- **輸入層（Input Layer）**：接收原始資料
- **隱藏層（Hidden Layers）**：在中間進行複雜的運算，可以有多層
- **輸出層（Output Layer）**：產生最終結果

每一層的每個神經元都與下一層的所有神經元相連，這種結構稱為 **全連接層（Fully Connected Layer）**。

### 為什麼需要多層？

單一神經元只能畫一條「直線」來分類資料。但現實世界的問題往往更複雜——想像你要辨識手寫數字，一條直線怎麼可能區分 0 和 8？多層結構讓神經網路能學習越來越抽象的特徵，從簡單的邊緣到複雜的形狀。

前往沙盒可以親眼看到訊號如何在這些層之間流動！`,
      },
    ],
    nextChapter: 2,
  },
  // ============================================================
  // Chapter 2
  // ============================================================
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
4. 如果總和 ≥ 0，輸出 1；否則輸出 0

### 感知器的學習法則

感知器最厲害的地方在於它能 **自動學習**！學習的規則很簡單：

\`w_new = w_old + learning_rate × error × input\`
\`b_new = b_old + learning_rate × error\`

其中 error = 正確答案 - 預測結果。如果預測正確，error = 0，權重不變。如果預測錯誤，權重就會朝正確的方向調整。`,
      },
      {
        type: "text",
        content: `## 線性分類

想像你有一堆資料點在二維平面上，分成兩類（紅色和藍色）。感知器的任務就是找到一條 **直線**，把這兩類分開。

這條線的方程式就是：
\`w₁x₁ + w₂x₂ + b = 0\`

- 線的一側：w₁x₁ + w₂x₂ + b > 0 → 分類為 1
- 線的另一側：w₁x₁ + w₂x₂ + b < 0 → 分類為 0

### 邏輯閘作為例子

邏輯閘是理解感知器的最好例子：

**AND 邏輯閘**（兩個都為 1 才輸出 1）：
- (0,0) → 0、(0,1) → 0、(1,0) → 0、(1,1) → 1
- 可以用一條直線分開 ✓

**OR 邏輯閘**（至少一個為 1 就輸出 1）：
- (0,0) → 0、(0,1) → 1、(1,0) → 1、(1,1) → 1
- 可以用一條直線分開 ✓

**XOR 邏輯閘**（兩個不同才輸出 1）：
- (0,0) → 0、(0,1) → 1、(1,0) → 1、(1,1) → 0
- **無法用一條直線分開 ✗** — 這就是感知器的根本限制！`,
      },
      {
        type: "code-step",
        content: `class Perceptron {
  constructor(inputSize, learningRate = 0.1) {
    this.weights = Array.from(
      { length: inputSize },
      () => Math.random() * 2 - 1
    );
    this.bias = Math.random() * 2 - 1;
    this.lr = learningRate;
  }

  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum >= 0 ? 1 : 0;
  }

  train(inputs, target) {
    const prediction = this.predict(inputs);
    const error = target - prediction;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.lr * error * inputs[i];
    }
    this.bias += this.lr * error;
    return error;
  }
}`,
        steps: [
          {
            title: "步驟一：建構子 — 初始化權重",
            code: "constructor(inputSize, learningRate = 0.1) {\n  this.weights = Array.from(\n    { length: inputSize },\n    () => Math.random() * 2 - 1\n  );\n  this.bias = Math.random() * 2 - 1;\n  this.lr = learningRate;\n}",
            explanation: "建構子接收輸入數量和學習率。\n\n• weights 陣列的長度等於輸入數量，每個權重隨機初始化在 -1 到 1 之間\n• bias 也隨機初始化在 -1 到 1 之間\n• lr 是學習率（learning rate），控制每次學習的步伐大小\n\n為什麼要隨機初始化？如果所有權重都是 0，感知器就沒有辦法區分不同輸入的重要性，學習就會卡住。"
          },
          {
            title: "步驟二：predict — 預測函數",
            code: "predict(inputs) {\n  let sum = this.bias;\n  for (let i = 0; i < inputs.length; i++) {\n    sum += inputs[i] * this.weights[i];\n  }\n  return sum >= 0 ? 1 : 0;\n}",
            explanation: "預測函數就是前面學到的「神經元」運算：\n\n1. 從 bias 開始（不是從 0 開始，這樣更簡潔）\n2. 遍歷每個輸入，乘以對應權重並加到 sum\n3. 最後用階梯函數：sum ≥ 0 → 1，否則 → 0\n\n這個函數不會改變任何權重，純粹是「看看目前的感知器會怎麼判斷」。"
          },
          {
            title: "步驟三：train — 學習函數",
            code: "train(inputs, target) {\n  const prediction = this.predict(inputs);\n  const error = target - prediction;\n  for (let i = 0; i < this.weights.length; i++) {\n    this.weights[i] += this.lr * error * inputs[i];\n  }\n  this.bias += this.lr * error;\n  return error;\n}",
            explanation: "這是感知器學習的核心！\n\n1. 先用 predict 得到目前的預測結果\n2. 計算誤差 error = 正確答案 - 預測結果\n   • 預測正確：error = 0，不更新\n   • 預測 0 但正確答案是 1：error = 1，增加權重\n   • 預測 1 但正確答案是 0：error = -1，減少權重\n3. 用公式更新每個權重：w += lr × error × input\n4. 同樣更新偏差：b += lr × error\n\n學習率 lr 控制每次調整的幅度。太大會震盪，太小會學得慢。"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 感知器學習演算法
class Perceptron {
  constructor(inputSize, learningRate = 0.1) {
    this.weights = Array.from(
      { length: inputSize },
      () => Math.random() * 2 - 1
    );
    this.bias = Math.random() * 2 - 1;
    this.lr = learningRate;
  }

  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum >= 0 ? 1 : 0;
  }

  train(inputs, target) {
    const prediction = this.predict(inputs);
    const error = target - prediction;
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

for (let epoch = 0; epoch < 100; epoch++) {
  for (const data of trainingData) {
    p.train(data.inputs, data.target);
  }
}

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
      {
        type: "quiz",
        content: JSON.stringify({
          question: "感知器的學習規則中，如果預測結果是 1 但正確答案是 0，error 的值是多少？",
          options: [
            "1",
            "-1",
            "0",
            "0.5",
          ],
          correct: 1,
          explanation: "error = target - prediction = 0 - 1 = -1。這個負的誤差會導致權重減小，讓感知器下次對同樣的輸入更不容易輸出 1。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "學習率（Learning Rate）太大會怎樣？",
          options: [
            "學習更快更好",
            "權重更新幅度太大，可能震盪不收斂",
            "記憶體不夠用",
            "會增加輸入的數量",
          ],
          correct: 1,
          explanation: "學習率控制每次權重更新的幅度。如果太大，權重會劇烈變化，可能在最佳值附近來回震盪，永遠無法穩定收斂。適當的學習率能讓感知器穩定地逼近正確的權重。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：訓練 OR 邏輯閘感知器",
          description: "利用上面學到的 Perceptron 類別，建立一個感知器並訓練它學習 OR 邏輯閘。\n\nOR 真值表：(0,0)→0、(0,1)→1、(1,0)→1、(1,1)→1\n\n請完成 trainOR 函數，回傳訓練好的感知器。",
          starterCode: `class Perceptron {
  constructor(inputSize, learningRate = 0.1) {
    this.weights = Array.from({ length: inputSize }, () => Math.random() * 2 - 1);
    this.bias = Math.random() * 2 - 1;
    this.lr = learningRate;
  }
  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) sum += inputs[i] * this.weights[i];
    return sum >= 0 ? 1 : 0;
  }
  train(inputs, target) {
    const pred = this.predict(inputs);
    const error = target - pred;
    for (let i = 0; i < this.weights.length; i++) this.weights[i] += this.lr * error * inputs[i];
    this.bias += this.lr * error;
  }
}

function trainOR() {
  const p = new Perceptron(2);
  // TODO: 定義 OR 邏輯閘的訓練資料
  // TODO: 訓練 100 輪
  return p;
}

const p = trainOR();
console.log(p.predict([0, 0]));
console.log(p.predict([0, 1]));
console.log(p.predict([1, 0]));
console.log(p.predict([1, 1]));`,
          solution: `class Perceptron {
  constructor(inputSize, learningRate = 0.1) {
    this.weights = Array.from({ length: inputSize }, () => Math.random() * 2 - 1);
    this.bias = Math.random() * 2 - 1;
    this.lr = learningRate;
  }
  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) sum += inputs[i] * this.weights[i];
    return sum >= 0 ? 1 : 0;
  }
  train(inputs, target) {
    const pred = this.predict(inputs);
    const error = target - pred;
    for (let i = 0; i < this.weights.length; i++) this.weights[i] += this.lr * error * inputs[i];
    this.bias += this.lr * error;
  }
}

function trainOR() {
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
  return p;
}

const p = trainOR();
console.log(p.predict([0, 0]));
console.log(p.predict([0, 1]));
console.log(p.predict([1, 0]));
console.log(p.predict([1, 1]));`,
          testCases: [
            { input: "console.log(p.predict([0, 0]))", expected: "0" },
            { input: "console.log(p.predict([0, 1]))", expected: "1" },
            { input: "console.log(p.predict([1, 0]))", expected: "1" },
            { input: "console.log(p.predict([1, 1]))", expected: "1" },
          ],
          hints: [
            "OR 邏輯閘的訓練資料：(0,0)→0、(0,1)→1、(1,0)→1、(1,1)→1",
            "用 for 迴圈訓練 100 輪（epochs），每輪遍歷所有訓練資料",
            "記得在迴圈結束後 return p",
          ],
        },
      },
    ],
    prevChapter: 1,
    nextChapter: 3,
  },
  // ============================================================
  // Chapter 3
  // ============================================================
  {
    id: 3,
    title: "激活函數",
    subtitle: "Sigmoid、ReLU、Tanh 的原理與視覺化",
    icon: "📈",
    sections: [
      {
        type: "text",
        content: `## 為什麼需要激活函數？

在前面的章節中，我們使用了最簡單的「階梯函數」——只輸出 0 或 1。但這有個大問題：**不夠平滑**。

想像你在學射箭，如果只有「中靶」和「沒中靶」兩種反饋，你很難知道自己差了多少、該怎麼調整。但如果有一個分數告訴你「你離靶心還差 3 公分」，你就知道該微調多少。

激活函數就是這樣的「評分系統」。它讓神經元的輸出不再只是 0 和 1，而是有 **連續的梯度** 可以用來指導學習。

### 激活函數的核心作用

1. **引入非線性**：如果沒有激活函數，多層神經網路再怎麼堆疊，結果都只是線性變換，等於只有一層
2. **提供梯度**：讓網路能透過梯度下降來學習
3. **控制輸出範圍**：將輸出限制在特定範圍內`,
      },
      {
        type: "text",
        content: `## Sigmoid 函數

**公式**：σ(x) = 1 / (1 + e⁻ˣ)

**特點**：
- 輸出範圍：(0, 1)
- S 形曲線，平滑且可微分
- 當 x 非常大時，輸出接近 1；x 非常小時，輸出接近 0
- 中間區域（x 接近 0）變化最敏感

**優點**：輸出可以解讀為「機率」，適合二元分類
**缺點**：容易出現「梯度消失」——當 x 太大或太小時，梯度幾乎為 0，學習停滯

## ReLU（Rectified Linear Unit）

**公式**：ReLU(x) = max(0, x)

**特點**：
- 輸出範圍：[0, ∞)
- x > 0 時直接輸出 x，x ≤ 0 時輸出 0
- 計算極其簡單高效

**優點**：不會出現梯度消失（正數區域），訓練速度快
**缺點**：「dying ReLU」問題——如果神經元的輸入總是負數，它就永遠不會被激活

## Tanh（雙曲正切）

**公式**：tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)

**特點**：
- 輸出範圍：(-1, 1)
- 零中心化，正負對稱
- 形狀類似 Sigmoid，但輸出範圍更大

**優點**：零中心化讓優化更容易
**缺點**：同樣有梯度消失問題`,
      },
      {
        type: "code-step",
        content: `// 三種常見的激活函數
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function relu(x) {
  return Math.max(0, x);
}

function tanh_fn(x) {
  return Math.tanh(x);
}

// 比較三種函數在不同輸入下的輸出
const testValues = [-3, -1, 0, 1, 3];
for (const x of testValues) {
  console.log(\`x=\${x}: sigmoid=\${sigmoid(x).toFixed(3)}, relu=\${relu(x)}, tanh=\${tanh_fn(x).toFixed(3)}\`);
}`,
        steps: [
          {
            title: "Sigmoid 實作",
            code: "function sigmoid(x) {\n  return 1 / (1 + Math.exp(-x));\n}",
            explanation: "Sigmoid 函數使用自然指數 e。\n\n• Math.exp(-x) 計算 e 的 -x 次方\n• 當 x = 0：1 / (1 + 1) = 0.5（中間值）\n• 當 x = 5：1 / (1 + e⁻⁵) ≈ 0.993（接近 1）\n• 當 x = -5：1 / (1 + e⁵) ≈ 0.007（接近 0）\n\nSigmoid 的輸出永遠在 0 和 1 之間，常被解讀為「機率」。"
          },
          {
            title: "ReLU 實作",
            code: "function relu(x) {\n  return Math.max(0, x);\n}",
            explanation: "ReLU 是最簡單也最常用的激活函數。\n\n• 如果輸入是正數，直接輸出該數值\n• 如果輸入是 0 或負數，輸出 0\n\n就像一個「只通過正數」的閥門。雖然簡單，但在實際應用中效果非常好，而且計算效率高。"
          },
          {
            title: "Tanh 實作",
            code: "function tanh_fn(x) {\n  return Math.tanh(x);\n}",
            explanation: "Tanh 函數的輸出在 -1 到 1 之間。\n\n• x = 0 → 輸出 0（零中心化）\n• x 很大 → 輸出接近 1\n• x 很小 → 輸出接近 -1\n\n與 Sigmoid 相比，Tanh 的輸出是零中心化的，這在某些情況下能讓梯度下降更穩定。"
          },
          {
            title: "比較三種函數",
            code: "const testValues = [-3, -1, 0, 1, 3];\nfor (const x of testValues) {\n  console.log(`x=${x}: sigmoid=${sigmoid(x).toFixed(3)}, relu=${relu(x)}, tanh=${tanh_fn(x).toFixed(3)}`);\n}",
            explanation: "讓我們比較三種函數在相同輸入下的行為：\n\nx=-3: sigmoid≈0.047, relu=0, tanh≈-0.995\nx=-1: sigmoid≈0.269, relu=0, tanh≈-0.762\nx= 0: sigmoid=0.500, relu=0, tanh=0.000\nx= 1: sigmoid≈0.731, relu=1, tanh≈0.762\nx= 3: sigmoid≈0.953, relu=3, tanh≈0.995\n\n注意 ReLU 在負數區域完全為 0，而 Sigmoid 和 Tanh 則有平滑的過渡。"
          }
        ],
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

function tanh_fn(x) {
  return Math.tanh(x);
}

// 比較不同輸入下的輸出
const testValues = [-3, -1, 0, 1, 3];
console.log("x\\t| Sigmoid\\t| ReLU\\t| Tanh");
console.log("-".repeat(50));
for (const x of testValues) {
  console.log(\`\${x}\\t| \${sigmoid(x).toFixed(4)}\\t| \${relu(x)}\\t| \${tanh_fn(x).toFixed(4)}\`);
}

// 梯度消失示範
console.log("\\n--- 梯度消失示範 ---");
console.log("sigmoid(10) =", sigmoid(10).toFixed(6), "→ 梯度幾乎為 0");
console.log("sigmoid(-10) =", sigmoid(-10).toFixed(6), "→ 梯度幾乎為 0");
console.log("sigmoid(0) =", sigmoid(0).toFixed(6), "→ 梯度最大");`,
        explanation: "這段程式碼實作了三種常見的激活函數並比較它們的行為。注意觀察 Sigmoid 在極端值時趨於飽和（梯度接近 0），而 ReLU 在正數區域保持線性增長。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼 ReLU 比 Sigmoid 更常用於深度神經網路的隱藏層？",
          options: [
            "因為 ReLU 的輸出範圍更大",
            "因為 ReLU 不容易出現梯度消失問題",
            "因為 ReLU 的輸出是機率值",
            "因為 ReLU 的形狀更像 S 曲線",
          ],
          correct: 1,
          explanation: "ReLU 在正數區域的梯度恆為 1，不會像 Sigmoid 在極端值時梯度趨近 0（梯度消失）。這使得深度神經網路中的梯度能順利傳遞，訓練更穩定、更快速。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Sigmoid 函數當 x = 0 時的輸出值是多少？",
          options: [
            "0",
            "0.5",
            "1",
            "-0.5",
          ],
          correct: 1,
          explanation: "σ(0) = 1 / (1 + e⁰) = 1 / (1 + 1) = 0.5。Sigmoid 函數在 x = 0 時輸出 0.5，也就是 S 曲線的正中間。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 Leaky ReLU",
          description: "Leaky ReLU 是 ReLU 的改良版，解決了 dying ReLU 的問題。\n\n規則：如果 x > 0，輸出 x；否則輸出 0.01 * x（而不是 0）。\n\n這樣即使輸入是負數，也有一個很小的梯度，讓神經元不會完全「死掉」。",
          starterCode: `function leakyRelu(x) {
  // TODO: 實作 Leaky ReLU
  // x > 0 → 回傳 x
  // x <= 0 → 回傳 0.01 * x
}

console.log(leakyRelu(5));
console.log(leakyRelu(-3));
console.log(leakyRelu(0));`,
          solution: `function leakyRelu(x) {
  return x > 0 ? x : 0.01 * x;
}

console.log(leakyRelu(5));
console.log(leakyRelu(-3));
console.log(leakyRelu(0));`,
          testCases: [
            { input: "console.log(leakyRelu(5))", expected: "5" },
            { input: "console.log(leakyRelu(-3))", expected: "-0.03" },
            { input: "console.log(leakyRelu(0))", expected: "0" },
          ],
          hints: [
            "用三元運算子 x > 0 ? ... : ... 來判斷",
            "負數區域要乘以 0.01，不是回傳 0",
            "x = 0 時歸類到 <= 0 的情況，回傳 0.01 * 0 = 0",
          ],
        },
      },
    ],
    prevChapter: 2,
    nextChapter: 4,
  },
  // ============================================================
  // Chapter 4
  // ============================================================
  {
    id: 4,
    title: "前向傳播",
    subtitle: "資料如何在網路中流動",
    icon: "➡️",
    sections: [
      {
        type: "text",
        content: `## 什麼是前向傳播？

前向傳播（Forward Propagation）是神經網路做預測的過程。資料從 **輸入層** 開始，逐層經過 **隱藏層**，最後到達 **輸出層**。每一層的每個神經元都會：

1. 接收上一層所有神經元的輸出
2. 計算加權求和 + 偏差
3. 通過激活函數
4. 將結果傳給下一層

### 用餐廳比喻

想像一個三道菜的餐廳：
- **輸入層** = 食材（番茄、麵粉、起司）
- **隱藏層 1** = 備料廚師（切菜、揉麵、磨起司）
- **隱藏層 2** = 烹飪廚師（烤披薩、煮湯）
- **輸出層** = 擺盤出菜

食材依序經過每個廚師的處理，最後變成完整的料理。每個「廚師」就是一個神經元，他們各自的「手藝」就是權重。`,
      },
      {
        type: "text",
        content: `## 矩陣運算

在實際實作中，我們用 **矩陣乘法** 來高效地一次計算整層的輸出：

\`output = activation(W · input + b)\`

其中：
- **W** 是權重矩陣（每一行對應一個神經元的權重）
- **input** 是輸入向量
- **b** 是偏差向量
- **activation** 是激活函數

### Xavier 初始化

權重的初始值很重要！太大會導致輸出爆炸，太小會導致訊號消失。

**Xavier 初始化**（也稱為 Glorot 初始化）的做法是：
從均值為 0、標準差為 √(2 / (n_in + n_out)) 的分佈中隨機取值。

其中 n_in 是輸入神經元數量，n_out 是輸出神經元數量。這能讓每一層的輸出保持合理的範圍。`,
      },
      {
        type: "code-step",
        content: `class Layer {
  constructor(inputSize, outputSize) {
    // Xavier 初始化
    const scale = Math.sqrt(2 / (inputSize + outputSize));
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale)
    );
    this.biases = new Array(outputSize).fill(0);
  }

  forward(inputs) {
    this.lastInput = inputs;
    this.lastOutput = this.weights.map((neuronWeights, i) => {
      let sum = this.biases[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += neuronWeights[j] * inputs[j];
      }
      return 1 / (1 + Math.exp(-sum)); // sigmoid
    });
    return this.lastOutput;
  }
}

// 建構簡單的兩層網路
const hidden = new Layer(2, 3);
const output = new Layer(3, 1);

const input = [0.5, 0.8];
const h = hidden.forward(input);
const o = output.forward(h);

console.log("輸入:", input);
console.log("隱藏層輸出:", h.map(v => v.toFixed(4)));
console.log("最終輸出:", o.map(v => v.toFixed(4)));`,
        steps: [
          {
            title: "Layer 類別：Xavier 初始化",
            code: "constructor(inputSize, outputSize) {\n  const scale = Math.sqrt(2 / (inputSize + outputSize));\n  this.weights = Array.from({ length: outputSize }, () =>\n    Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale)\n  );\n  this.biases = new Array(outputSize).fill(0);\n}",
            explanation: "建構子使用 Xavier 初始化：\n\n• scale = √(2 / (輸入數 + 輸出數))，確保權重不會太大或太小\n• weights 是二維陣列：外層代表輸出神經元，內層代表對應輸入的權重\n• 例如 Layer(2, 3) 會建立一個 3×2 的權重矩陣（3 個神經元，每個有 2 個權重）\n• biases 全部初始化為 0"
          },
          {
            title: "forward 方法：逐層計算",
            code: "forward(inputs) {\n  this.lastInput = inputs;\n  this.lastOutput = this.weights.map((neuronWeights, i) => {\n    let sum = this.biases[i];\n    for (let j = 0; j < inputs.length; j++) {\n      sum += neuronWeights[j] * inputs[j];\n    }\n    return 1 / (1 + Math.exp(-sum));\n  });\n  return this.lastOutput;\n}",
            explanation: "前向傳播的核心：\n\n1. 儲存 lastInput（之後反向傳播會用到）\n2. 對這一層的每個神經元：\n   - 先加上偏差\n   - 遍歷所有輸入，加上 input × weight\n   - 通過 Sigmoid 激活函數\n3. 回傳所有神經元的輸出\n\n如果這一層有 3 個神經元、2 個輸入，就會計算 3 次加權求和。"
          },
          {
            title: "串接兩層網路",
            code: "const hidden = new Layer(2, 3);\nconst output = new Layer(3, 1);\n\nconst input = [0.5, 0.8];\nconst h = hidden.forward(input);\nconst o = output.forward(h);",
            explanation: "我們建立了一個 2→3→1 的網路：\n\n• 輸入層：2 個值\n• 隱藏層：3 個神經元（接收 2 個輸入，產出 3 個值）\n• 輸出層：1 個神經元（接收 3 個輸入，產出 1 個值）\n\n資料流動：input [0.5, 0.8] → 隱藏層計算 → h [?, ?, ?] → 輸出層計算 → o [?]\n\n每次呼叫 forward 就是一次前向傳播，把上一層的輸出作為下一層的輸入。"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `class Layer {
  constructor(inputSize, outputSize) {
    const scale = Math.sqrt(2 / (inputSize + outputSize));
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale)
    );
    this.biases = new Array(outputSize).fill(0);
  }

  forward(inputs) {
    this.lastInput = inputs;
    this.lastOutput = this.weights.map((neuronWeights, i) => {
      let sum = this.biases[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += neuronWeights[j] * inputs[j];
      }
      return 1 / (1 + Math.exp(-sum)); // sigmoid
    });
    return this.lastOutput;
  }
}

// 建構 2→3→1 網路並做前向傳播
const hidden = new Layer(2, 3);
const output = new Layer(3, 1);

const input = [0.5, 0.8];
console.log("=== 前向傳播 ===");
console.log("輸入:", input);

const h = hidden.forward(input);
console.log("隱藏層輸出:", h.map(v => v.toFixed(4)));

const o = output.forward(h);
console.log("最終輸出:", o.map(v => v.toFixed(4)));`,
        explanation: "這個例子建立了一個兩層的神經網路（一個隱藏層 + 一個輸出層），並展示資料如何從輸入逐層流向輸出。每一層都做加權求和再通過 Sigmoid 激活函數。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "在一個 4→5→3 的神經網路中，隱藏層的權重矩陣大小是多少？",
          options: [
            "4 × 3",
            "5 × 4",
            "4 × 5",
            "3 × 5",
          ],
          correct: 1,
          explanation: "隱藏層有 5 個神經元，每個接收 4 個輸入，所以權重矩陣是 5×4（5 行 4 列）。每一行代表一個神經元的所有權重。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Xavier 初始化的目的是什麼？",
          options: [
            "讓所有權重都是 0",
            "讓每一層的輸出保持合理的數值範圍",
            "讓網路只有一層",
            "加快程式的執行速度",
          ],
          correct: 1,
          explanation: "Xavier 初始化根據輸入和輸出的神經元數量來決定權重的初始範圍。這能讓每一層的輸出保持在合理的範圍內，避免訊號在傳播過程中爆炸或消失，讓訓練更穩定。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：手動前向傳播",
          description: "給定一個有 2 個輸入、2 個隱藏神經元、1 個輸出的網路。\n\n隱藏層權重：[[0.5, -0.3], [0.2, 0.8]]\n隱藏層偏差：[0.1, -0.1]\n輸出層權重：[[0.6, -0.4]]\n輸出層偏差：[0.2]\n\n使用 Sigmoid 激活函數，計算輸入 [1, 0.5] 的輸出。",
          starterCode: `function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function forwardPass(input) {
  // 隱藏層
  const hw = [[0.5, -0.3], [0.2, 0.8]];
  const hb = [0.1, -0.1];
  // TODO: 計算隱藏層輸出 h（2 個值）

  // 輸出層
  const ow = [[0.6, -0.4]];
  const ob = [0.2];
  // TODO: 計算輸出層結果 o（1 個值）

  return o[0];
}

console.log(forwardPass([1, 0.5]).toFixed(4));`,
          solution: `function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function forwardPass(input) {
  const hw = [[0.5, -0.3], [0.2, 0.8]];
  const hb = [0.1, -0.1];
  const h = hw.map((w, i) => {
    let sum = hb[i];
    for (let j = 0; j < input.length; j++) sum += w[j] * input[j];
    return sigmoid(sum);
  });

  const ow = [[0.6, -0.4]];
  const ob = [0.2];
  const o = ow.map((w, i) => {
    let sum = ob[i];
    for (let j = 0; j < h.length; j++) sum += w[j] * h[j];
    return sigmoid(sum);
  });

  return o[0];
}

console.log(forwardPass([1, 0.5]).toFixed(4));`,
          testCases: [
            { input: "console.log(forwardPass([1, 0.5]).toFixed(4))", expected: "0.5874" },
          ],
          hints: [
            "隱藏層每個神經元：sum = bias + w[0]*input[0] + w[1]*input[1]，然後 sigmoid(sum)",
            "用 map 對每行權重計算一個輸出",
            "輸出層同理，只是輸入變成隱藏層的輸出 h",
          ],
        },
      },
    ],
    prevChapter: 3,
    nextChapter: 5,
  },
  // ============================================================
  // Chapter 5
  // ============================================================
  {
    id: 5,
    title: "損失函數與優化",
    subtitle: "衡量模型的好壞並改進它",
    icon: "🎯",
    sections: [
      {
        type: "text",
        content: `## 損失函數：衡量「差多少」

訓練神經網路就像練習射箭——你需要知道自己「差了多少」才能改進。**損失函數**（Loss Function）就是這個衡量標準。

### 均方誤差（MSE）

最直觀的損失函數。計算預測值和正確答案之間的「距離平方的平均值」。

**公式**：MSE = (1/n) × Σ(predicted - actual)²

**直覺**：
- 如果預測完全正確，MSE = 0（完美！）
- 誤差越大，MSE 越大
- 取平方是為了讓正誤差和負誤差不會互相抵消

### 交叉熵損失（Cross-Entropy Loss）

更適合分類問題的損失函數。

**公式**：CE = -Σ[actual × log(predicted) + (1 - actual) × log(1 - predicted)]

**直覺**：
- 當模型「非常自信且正確」時，損失接近 0
- 當模型「非常自信但錯誤」時，損失會變得非常大
- 比 MSE 更能「懲罰」嚴重的錯誤預測`,
      },
      {
        type: "text",
        content: `## 梯度下降：朝正確方向前進

知道「差多少」之後，下一步就是「怎麼改進」。答案是 **梯度下降**（Gradient Descent）。

### 山谷的比喻

想像你被蒙上眼睛站在一座山上，想找到最低的山谷（最低損失）。你的策略是：
1. 感受腳下的坡度（計算梯度）
2. 朝最陡的下坡方向走一步（更新權重）
3. 重複直到到達谷底

**梯度** 就是「坡度」——它告訴你在當前位置，往哪個方向能最快降低損失。

### 學習率

學習率決定每一步走多大：
- **太大**：步伐太大，可能跨過谷底，來回震盪
- **太小**：步伐太小，需要很久才能到谷底
- **剛剛好**：穩定且有效率地收斂

常見的學習率：0.001 到 0.1 之間

### 權重更新公式

\`w_new = w_old - learning_rate × gradient\`

注意是「減去」梯度——因為梯度指向上坡方向，我們要往反方向（下坡）走。`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 損失函數比較
function mse(predicted, actual) {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    sum += (predicted[i] - actual[i]) ** 2;
  }
  return sum / predicted.length;
}

function crossEntropy(predicted, actual) {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    const p = Math.max(1e-7, Math.min(1 - 1e-7, predicted[i]));
    sum += actual[i] * Math.log(p) + (1 - actual[i]) * Math.log(1 - p);
  }
  return -sum / predicted.length;
}

// 比較不同預測的損失值
const actual = [1, 0, 1, 0];

const goodPred = [0.9, 0.1, 0.8, 0.2];
const badPred  = [0.5, 0.5, 0.5, 0.5];
const worsPred = [0.1, 0.9, 0.2, 0.8];

console.log("=== 損失函數比較 ===");
console.log("好的預測:", goodPred);
console.log("  MSE:", mse(goodPred, actual).toFixed(4));
console.log("  CE:", crossEntropy(goodPred, actual).toFixed(4));

console.log("\\n普通預測:", badPred);
console.log("  MSE:", mse(badPred, actual).toFixed(4));
console.log("  CE:", crossEntropy(badPred, actual).toFixed(4));

console.log("\\n差的預測:", worsPred);
console.log("  MSE:", mse(worsPred, actual).toFixed(4));
console.log("  CE:", crossEntropy(worsPred, actual).toFixed(4));`,
        explanation: "這段程式碼比較了 MSE 和交叉熵在不同預測品質下的損失值。注意交叉熵對「非常自信但錯誤」的預測懲罰更重。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "梯度下降中，為什麼權重更新公式是「減去」梯度而不是「加上」？",
          options: [
            "為了增加損失",
            "因為梯度指向損失增加的方向，我們要往相反方向走",
            "減法比加法計算更快",
            "為了讓權重變成 0",
          ],
          correct: 1,
          explanation: "梯度指向損失函數增長最快的方向（上坡）。為了降低損失，我們需要往梯度的反方向走（下坡），所以用 w = w - lr × gradient。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "MSE 損失函數中，為什麼要取「平方」而不是直接用差值？",
          options: [
            "讓計算更複雜",
            "讓正誤差和負誤差不會互相抵消",
            "限制輸出範圍",
            "加快訓練速度",
          ],
          correct: 1,
          explanation: "如果直接用差值（predicted - actual），正的誤差和負的誤差加起來可能互相抵消，讓損失看起來很小。取平方後所有值都是正的，能真正反映整體的誤差大小。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 MSE 損失函數",
          description: "實作一個 MSE（均方誤差）損失函數。接收兩個等長的數字陣列，回傳它們的均方誤差。\n\n公式：MSE = (1/n) × Σ(predicted[i] - actual[i])²",
          starterCode: `function mse(predicted, actual) {
  // TODO: 計算均方誤差
}

console.log(mse([1, 0, 1], [1, 0, 1]));
console.log(mse([0.5, 0.5], [1, 0]));
console.log(mse([0, 1, 0, 1], [1, 0, 1, 0]));`,
          solution: `function mse(predicted, actual) {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    sum += (predicted[i] - actual[i]) ** 2;
  }
  return sum / predicted.length;
}

console.log(mse([1, 0, 1], [1, 0, 1]));
console.log(mse([0.5, 0.5], [1, 0]));
console.log(mse([0, 1, 0, 1], [1, 0, 1, 0]));`,
          testCases: [
            { input: "console.log(mse([1, 0, 1], [1, 0, 1]))", expected: "0" },
            { input: "console.log(mse([0.5, 0.5], [1, 0]))", expected: "0.25" },
            { input: "console.log(mse([0, 1, 0, 1], [1, 0, 1, 0]))", expected: "1" },
          ],
          hints: [
            "用 for 迴圈遍歷每個元素",
            "計算 (predicted[i] - actual[i]) 的平方並加總",
            "最後除以陣列長度得到平均值",
          ],
        },
      },
    ],
    prevChapter: 4,
    nextChapter: 6,
  },
  // ============================================================
  // Chapter 6
  // ============================================================
  {
    id: 6,
    title: "反向傳播",
    subtitle: "神經網路如何學習——梯度下降的核心",
    icon: "🔄",
    sections: [
      {
        type: "text",
        content: `## 反向傳播：從輸出到輸入

反向傳播（Backpropagation）是神經網路學習的核心算法。簡單來說，它是 **從輸出往回算**，找出每個權重對損失的「貢獻」有多大，然後相應地調整。

### 工廠的比喻

想像一間巧克力工廠有三道工序：
1. 研磨可可豆（第一層）
2. 混合糖和奶粉（第二層）
3. 成型包裝（第三層）

如果最後的巧克力太甜了，你需要：
1. 先看看是不是包裝環節的問題（輸出層）
2. 再往回看混合的比例對不對（隱藏層）
3. 最後看看研磨的粗細是否影響（輸入層）

這就是「反向」的含義——**從結果往回追溯原因**。

### 鏈式法則

反向傳播的數學基礎是 **鏈式法則**（Chain Rule）：

如果 y = f(g(x))，那麼 dy/dx = dy/dg × dg/dx

就像問「從台北到高雄的距離」可以拆成「台北到台中的距離 × 台中到高雄的距離」。

在神經網路中：
- 損失對輸出層權重的梯度 = 損失對輸出的梯度 × 輸出對權重的梯度
- 損失對隱藏層權重的梯度 = 損失對輸出的梯度 × 輸出對隱藏層的梯度 × 隱藏層對權重的梯度`,
      },
      {
        type: "text",
        content: `## 反向傳播的步驟

### 1. 前向傳播
先正常計算一遍，得到預測結果和中間值（儲存備用）。

### 2. 計算輸出層梯度
比較預測結果和正確答案，計算損失的梯度。

### 3. 逐層往回傳播
用鏈式法則，把梯度從輸出層往回傳到每一層。

### 4. 更新權重
根據計算出的梯度，用梯度下降法更新所有權重。

### Sigmoid 的導數

Sigmoid 函數 σ(x) 的導數有一個很優美的形式：
σ'(x) = σ(x) × (1 - σ(x))

如果 σ(x) = 0.7，那麼導數 = 0.7 × 0.3 = 0.21

這就是為什麼我們在前向傳播時要儲存每層的輸出——反向傳播要用！`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// 完整的反向傳播示範
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function sigmoidDerivative(output) { return output * (1 - output); }

class SimpleNetwork {
  constructor() {
    // 2→2→1 的網路
    this.wHidden = [[0.5, -0.3], [0.2, 0.8]];
    this.bHidden = [0.1, -0.1];
    this.wOutput = [[0.6, -0.4]];
    this.bOutput = [0.2];
    this.lr = 0.5;
  }

  forward(input) {
    this.input = input;
    this.hidden = this.wHidden.map((w, i) => {
      let sum = this.bHidden[i];
      for (let j = 0; j < input.length; j++) sum += w[j] * input[j];
      return sigmoid(sum);
    });
    this.output = this.wOutput.map((w, i) => {
      let sum = this.bOutput[i];
      for (let j = 0; j < this.hidden.length; j++) sum += w[j] * this.hidden[j];
      return sigmoid(sum);
    });
    return this.output;
  }

  backward(target) {
    // 輸出層梯度
    const outputErrors = this.output.map((o, i) =>
      (o - target[i]) * sigmoidDerivative(o)
    );
    // 隱藏層梯度（用鏈式法則往回傳）
    const hiddenErrors = this.hidden.map((h, i) => {
      let error = 0;
      for (let j = 0; j < outputErrors.length; j++) {
        error += outputErrors[j] * this.wOutput[j][i];
      }
      return error * sigmoidDerivative(h);
    });
    // 更新輸出層權重
    for (let i = 0; i < this.wOutput.length; i++) {
      for (let j = 0; j < this.hidden.length; j++) {
        this.wOutput[i][j] -= this.lr * outputErrors[i] * this.hidden[j];
      }
      this.bOutput[i] -= this.lr * outputErrors[i];
    }
    // 更新隱藏層權重
    for (let i = 0; i < this.wHidden.length; i++) {
      for (let j = 0; j < this.input.length; j++) {
        this.wHidden[i][j] -= this.lr * hiddenErrors[i] * this.input[j];
      }
      this.bHidden[i] -= this.lr * hiddenErrors[i];
    }
  }

  train(input, target) {
    this.forward(input);
    this.backward(target);
    const loss = this.output.reduce((s, o, i) => s + (o - target[i]) ** 2, 0) / 2;
    return loss;
  }
}

const net = new SimpleNetwork();
const data = [
  { input: [0, 0], target: [0] },
  { input: [0, 1], target: [1] },
  { input: [1, 0], target: [1] },
  { input: [1, 1], target: [0] },
];

console.log("訓練 XOR（注意：2 層網路不一定能完全學會 XOR）");
for (let epoch = 0; epoch < 5000; epoch++) {
  let totalLoss = 0;
  for (const d of data) totalLoss += net.train(d.input, d.target);
  if (epoch % 1000 === 0) console.log(\`Epoch \${epoch}, Loss: \${totalLoss.toFixed(4)}\`);
}

console.log("\\n最終預測：");
for (const d of data) {
  const pred = net.forward(d.input);
  console.log(\`[\${d.input}] → \${pred[0].toFixed(4)} (期望: \${d.target})\`);
}`,
        explanation: "這是一個完整的反向傳播實作。網路嘗試學習 XOR 問題，雖然只有一個隱藏層（2 個神經元）可能不夠解決 XOR，但能讓你看到損失如何隨訓練下降。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "鏈式法則在反向傳播中的作用是什麼？",
          options: [
            "加快前向傳播的速度",
            "把輸出層的梯度逐層傳回到前面的層",
            "初始化權重",
            "決定網路的層數",
          ],
          correct: 1,
          explanation: "鏈式法則讓我們能夠將輸出層的梯度（誤差信號）逐層向前傳遞回去。每一層收到的梯度 = 後面層傳來的梯度 × 當前層的局部梯度。這樣每一層都知道自己的權重該怎麼調整。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼前向傳播時需要儲存每一層的輸出？",
          options: [
            "為了加快前向傳播速度",
            "因為反向傳播計算梯度時需要用到這些值",
            "為了印出除錯訊息",
            "為了節省記憶體",
          ],
          correct: 1,
          explanation: "反向傳播需要用到前向傳播的中間結果。例如 Sigmoid 的導數 = output × (1 - output)，需要知道 output 的值。隱藏層的梯度計算也需要用到前一層的輸入值。",
        }),
      },
    ],
    prevChapter: 5,
    nextChapter: 7,
  },
  // ============================================================
  // Chapter 7
  // ============================================================
  {
    id: 7,
    title: "建構完整的神經網路",
    subtitle: "從零開始用程式碼建立你的第一個神經網路",
    icon: "🏗️",
    sections: [
      {
        type: "text",
        content: `## 把一切整合起來！

恭喜你走到了最後一章！現在讓我們把前面所有章節學到的概念整合成一個完整的神經網路。

### 我們要解決的問題：XOR

XOR 是經典的測試問題。第二章我們知道單層感知器無法解決它，但 **多層神經網路可以**！

XOR 真值表：
- (0, 0) → 0
- (0, 1) → 1
- (1, 0) → 1
- (1, 1) → 0

### 網路架構

我們將建構一個 **2→4→1** 的網路：
- **輸入層**：2 個神經元（接收兩個輸入）
- **隱藏層**：4 個神經元（足夠學習 XOR 的非線性模式）
- **輸出層**：1 個神經元（輸出 0 或 1）

### 用到的概念

1. **Xavier 初始化**（第四章）
2. **Sigmoid 激活函數**（第三章）
3. **MSE 損失函數**（第五章）
4. **反向傳播 + 梯度下降**（第六章）`,
      },
      {
        type: "code",
        language: "javascript",
        content: `// ========================================
// 完整的神經網路：從零開始
// ========================================

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function sigmoidDeriv(out) { return out * (1 - out); }

class NeuralNetwork {
  constructor(layers) {
    this.weights = [];
    this.biases = [];
    for (let i = 0; i < layers.length - 1; i++) {
      const scale = Math.sqrt(2 / (layers[i] + layers[i + 1]));
      this.weights.push(
        Array.from({ length: layers[i + 1] }, () =>
          Array.from({ length: layers[i] }, () => (Math.random() * 2 - 1) * scale)
        )
      );
      this.biases.push(new Array(layers[i + 1]).fill(0));
    }
  }

  forward(input) {
    this.activations = [input];
    let current = input;
    for (let l = 0; l < this.weights.length; l++) {
      current = this.weights[l].map((w, i) => {
        let sum = this.biases[l][i];
        for (let j = 0; j < current.length; j++) sum += w[j] * current[j];
        return sigmoid(sum);
      });
      this.activations.push(current);
    }
    return current;
  }

  train(input, target, lr = 0.5) {
    const output = this.forward(input);

    // 計算各層的 delta
    const deltas = [];
    for (let l = this.weights.length - 1; l >= 0; l--) {
      const layerOutput = this.activations[l + 1];
      const delta = layerOutput.map((o, i) => {
        if (l === this.weights.length - 1) {
          return (o - target[i]) * sigmoidDeriv(o);
        } else {
          let err = 0;
          for (let j = 0; j < deltas[0].length; j++) {
            err += deltas[0][j] * this.weights[l + 1][j][i];
          }
          return err * sigmoidDeriv(o);
        }
      });
      deltas.unshift(delta);
    }

    // 更新權重和偏差
    for (let l = 0; l < this.weights.length; l++) {
      for (let i = 0; i < this.weights[l].length; i++) {
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] -= lr * deltas[l][i] * this.activations[l][j];
        }
        this.biases[l][i] -= lr * deltas[l][i];
      }
    }

    return output.reduce((s, o, i) => s + (o - target[i]) ** 2, 0) / 2;
  }
}

// 建構 2→4→1 網路
const nn = new NeuralNetwork([2, 4, 1]);

const xorData = [
  { input: [0, 0], target: [0] },
  { input: [0, 1], target: [1] },
  { input: [1, 0], target: [1] },
  { input: [1, 1], target: [0] },
];

// 訓練
console.log("開始訓練 XOR 神經網路...");
for (let epoch = 0; epoch <= 10000; epoch++) {
  let totalLoss = 0;
  for (const d of xorData) totalLoss += nn.train(d.input, d.target);
  if (epoch % 2000 === 0) {
    console.log(\`Epoch \${epoch.toString().padStart(5)}: Loss = \${totalLoss.toFixed(6)}\`);
  }
}

console.log("\\n=== 最終結果 ===");
for (const d of xorData) {
  const pred = nn.forward(d.input);
  const rounded = Math.round(pred[0]);
  const correct = rounded === d.target[0] ? "✓" : "✗";
  console.log(\`[\${d.input}] → \${pred[0].toFixed(4)} ≈ \${rounded} (期望: \${d.target[0]}) \${correct}\`);
}`,
        explanation: "這是一個完整的神經網路實作！它使用 Xavier 初始化、Sigmoid 激活函數、MSE 損失函數和反向傳播來學習 XOR 問題。訓練 10000 次後，應該能正確分類所有 XOR 輸入。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼我們需要 4 個隱藏層神經元來解決 XOR，而不是 1 個？",
          options: [
            "為了讓程式跑得更慢",
            "因為 XOR 是非線性問題，需要足夠的神經元來學習複雜的決策邊界",
            "為了使用更多記憶體",
            "因為 XOR 有 4 個訓練樣本",
          ],
          correct: 1,
          explanation: "XOR 的決策邊界不是一條直線，而是需要兩條線的組合。更多的隱藏層神經元提供了更多的「直線」來組合出複雜的邊界。理論上 2 個隱藏神經元就夠了，但 4 個讓學習更穩定、更容易收斂。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "在我們的完整網路中，訓練一筆資料的完整流程順序是？",
          options: [
            "更新權重 → 前向傳播 → 計算損失 → 反向傳播",
            "前向傳播 → 計算損失 → 反向傳播 → 更新權重",
            "反向傳播 → 前向傳播 → 更新權重 → 計算損失",
            "計算損失 → 前向傳播 → 更新權重 → 反向傳播",
          ],
          correct: 1,
          explanation: "正確的順序是：(1) 前向傳播得到預測結果 → (2) 用損失函數比較預測和正確答案 → (3) 反向傳播計算每個權重的梯度 → (4) 用梯度下降更新權重。這個循環不斷重複，網路就越來越好。",
        }),
      },
      {
        type: "text",
        content: `## 恭喜你完成了所有章節！ 🎉

你已經從零開始理解了神經網路的所有核心概念：

1. **神經元**：接收輸入、加權求和、通過激活函數
2. **感知器**：最簡單的學習單元
3. **激活函數**：引入非線性，讓網路能學習複雜模式
4. **前向傳播**：資料如何在網路中流動
5. **損失函數**：衡量預測的好壞
6. **反向傳播**：把誤差信號往回傳，更新權重

現在前往 **沙盒** 親手操作神經網路吧！你可以拖拉節點、改變權重，看看訊號如何在網路中流動。`,
      },
    ],
    prevChapter: 6,
  },
];

export function getTutorial(id: number): Tutorial | undefined {
  return tutorials.find((t) => t.id === id);
}