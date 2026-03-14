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
