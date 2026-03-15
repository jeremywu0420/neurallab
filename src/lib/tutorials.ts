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
  type: "text" | "code" | "math" | "interactive" | "quiz" | "code-step" | "coding-exercise" | "image" | "diagram";
  content: string;
  language?: string;
  explanation?: string;
  steps?: CodeStep[];
  exercise?: CodingExercise;
  /** For "image" type: URL or path (e.g. /images/tutorials/ch1-neuron.png) */
  src?: string;
  /** For "image"/"diagram": alt text or caption */
  caption?: string;
  /** For "diagram" type: the diagram variant to render */
  diagram?: string;
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
        type: "diagram",
        content: "single-neuron",
        diagram: "single-neuron",
        caption: "人工神經元的結構：輸入 × 權重 → 加總 + 偏差 → 激活函數 → 輸出",
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
        type: "diagram",
        content: "activation-functions",
        diagram: "activation-functions",
        caption: "三種常用激活函數的圖形比較：Sigmoid（0~1）、ReLU（≥0）、Tanh（-1~1）",
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

每一層的每個節點（神經元）都與下一層的所有節點相連，形成全連接的結構。`,
      },
      {
        type: "diagram",
        content: "multi-layer-network",
        diagram: "multi-layer-network",
        caption: "多層神經網路架構：3 個輸入 → 4 個隱藏神經元 → 4 個隱藏神經元 → 2 個輸出",
      },
      {
        type: "text",
        content: `### 前向傳播的數學

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
3. 重複直到到達谷底`,
      },
      {
        type: "diagram",
        content: "gradient-descent",
        diagram: "gradient-descent",
        caption: "梯度下降過程：從起始點沿著損失曲面逐步走向最小值",
      },
      {
        type: "text",
        content: `### 梯度下降的數學

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

如果最後的巧克力太甜了（Loss 太高），你需要：
1. 先看看是不是包裝環節的問題（輸出層）
2. 再往回看混合的比例對不對（隱藏層）
3. 最後看看研磨的粗細是否影響（輸入層）

這就是「反向」的含義——**從結果往回追溯原因**。`,
      },
      {
        type: "diagram",
        content: "backprop-flow",
        diagram: "backprop-flow",
        caption: "前向傳播（藍色）計算預測值；反向傳播（黃色）計算梯度並更新權重",
      },
      {
        type: "text",
        content: `### 鏈式法則

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
        content: `## 做得好！你已經建出了完整的神經網路！ 🎉

你在前 7 章中掌握了神經網路的所有基礎核心概念：

1. **神經元**：接收輸入、加權求和、通過激活函數
2. **感知器**：最簡單的學習單元
3. **激活函數**：引入非線性，讓網路能學習複雜模式
4. **前向傳播**：資料如何在網路中流動
5. **損失函數**：衡量預測的好壞
6. **反向傳播**：把誤差信號往回傳，更新權重
7. **完整實作**：從零建構並訓練一個解決 XOR 問題的網路

接下來的進階章節將帶你學習 **過擬合處理**、**進階優化器**、**CNN**、**RNN**，以及一個完整的 **實戰專案**！`,
      },
    ],
    prevChapter: 6,
    nextChapter: 8,
  },
  // ============================================================
  // Chapter 8
  // ============================================================
  {
    id: 8,
    title: "過擬合與正則化",
    subtitle: "讓模型真正「學會」而不是「背答案」",
    icon: "🛡️",
    sections: [
      {
        type: "text",
        content: `## 什麼是過擬合？

想像一個學生準備考試。有兩種學習方式：

**死記硬背型（過擬合）**：把所有考古題的答案背得滾瓜爛熟，但完全不理解為什麼。遇到新題目就傻了。

**理解型（良好泛化）**：理解題目背後的原理和邏輯，即使遇到沒見過的題目也能應用知識解答。

神經網路也是一樣！**過擬合（Overfitting）** 就是模型把訓練資料「背」起來了，包括資料中的雜訊和特殊情況。它在訓練資料上表現完美，但面對新資料時表現很差。

### 過擬合 vs 欠擬合

| 狀態 | 訓練表現 | 測試表現 | 問題 |
|------|---------|---------|------|
| **欠擬合（Underfitting）** | 差 | 差 | 模型太簡單，學不到規律 |
| **適當擬合（Good Fit）** | 好 | 好 | 這是我們的目標！ |
| **過擬合（Overfitting）** | 非常好 | 差 | 模型太複雜，記住了雜訊 |`,
      },
      {
        type: "diagram",
        content: "overfitting",
        diagram: "overfitting",
        caption: "欠擬合（模型太簡單）→ 適度擬合（恰到好處）→ 過擬合（模型太複雜，跟著雜訊走）",
      },
      {
        type: "text",
        content: `### 如何判斷過擬合？

最明顯的信號就是：**訓練損失持續下降，但驗證損失開始上升**。這代表模型正在「背答案」而不是「學規律」。`,
      },
      {
        type: "text",
        content: `## 資料分割：訓練集、驗證集、測試集

在訓練模型之前，我們必須把資料分成三份：

### 1. 訓練集（Training Set）— 約 70%
用來訓練模型的資料。模型會反覆學習這些資料中的規律。

### 2. 驗證集（Validation Set）— 約 15%
訓練過程中用來監控模型表現的資料。**模型不會用這些資料來學習**，而是用來判斷模型是否過擬合。

### 3. 測試集（Test Set）— 約 15%
訓練完成後才使用的資料。用來最終評估模型的泛化能力。**在整個訓練過程中絕對不能碰這些資料**。

### 用生活比喻理解

想像你在學開車：
- **訓練集** = 駕訓班的練習場（你在這裡反覆練習）
- **驗證集** = 模擬路考（讓你知道自己準備得如何）
- **測試集** = 正式路考（最終評估你的駕駛能力）

如果你只在練習場開得好（訓練集表現好），但模擬路考一直不及格（驗證集表現差），那你可能只是記住了練習場的路線，而不是真正學會開車。`,
      },
      {
        type: "text",
        content: `## 正則化技術

正則化是對抗過擬合的一系列方法。核心思想是：**限制模型的複雜度**，讓它不要記住太多細節。

### 1. L2 正則化（Weight Decay）

**原理**：在損失函數中加上一個「懲罰項」，懲罰過大的權重。

\`L_total = L_original + λ × Σ(w²)\`

- λ（lambda）是正則化強度，越大限制越嚴格
- Σ(w²) 是所有權重的平方和

**為什麼有效？** 大的權重意味著模型對某些特徵「過度依賴」。L2 正則化強迫權重保持小的值，讓模型不要對任何單一特徵過度敏感。

**生活比喻**：就像寫作文不能只用華麗的詞彙（大權重），而要用簡潔明瞭的語言（小權重）來表達想法。

### 2. Dropout

**原理**：訓練時隨機「關閉」一部分神經元（通常 20-50%），讓它們暫時不參與計算。

**為什麼有效？** 
- 防止神經元之間的「共同適應」（co-adaptation）
- 強迫每個神經元獨立學習有用的特徵
- 效果類似同時訓練多個不同的網路，然後取平均

**生活比喻**：就像籃球隊練習時，教練隨機讓一些球員坐板凳。這樣每個球員都要學會獨立作戰，而不是只依賴明星球員。整個隊伍變得更強壯。

**注意**：Dropout 只在訓練時使用！測試時所有神經元都參與。

### 3. 早停法（Early Stopping）

**原理**：監控驗證集損失，當驗證集損失連續多個 epoch 不再改善時，停止訓練。

**為什麼有效？** 在過擬合開始之前就喊停，保留模型泛化最好的狀態。

**生活比喻**：做菜時要適時關火。煮太久（訓練太久）食物就焦了（過擬合了）。`,
      },
      {
        type: "code-step",
        content: `// 展示過擬合與正則化的完整範例
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// 生成帶雜訊的訓練資料
function generateData(n) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 4 - 2;
    // 真正的規律：y = x > 0 ? 1 : 0（加入雜訊）
    const noise = (Math.random() - 0.5) * 0.3;
    const y = (x + noise) > 0 ? 1 : 0;
    data.push({ x: [x, x * x, Math.sin(x), Math.random()], y });
  }
  return data;
}

// 分割資料集
const allData = generateData(100);
const trainData = allData.slice(0, 70);
const valData = allData.slice(70, 85);
const testData = allData.slice(85);

// 簡單的神經網路（含 L2 正則化與 Dropout）
class RegularizedNetwork {
  constructor(inputSize, hiddenSize, lambda = 0.01, dropoutRate = 0.3) {
    this.lambda = lambda;
    this.dropoutRate = dropoutRate;
    // Xavier 初始化
    const scale1 = Math.sqrt(2 / (inputSize + hiddenSize));
    const scale2 = Math.sqrt(2 / (hiddenSize + 1));
    this.w1 = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale1)
    );
    this.b1 = new Array(hiddenSize).fill(0);
    this.w2 = Array.from({ length: 1 }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * scale2)
    );
    this.b2 = [0];
  }

  forward(input, training = false) {
    // 隱藏層
    this.hidden = this.b1.map((b, j) => {
      let sum = b;
      for (let i = 0; i < input.length; i++) sum += input[i] * this.w1[j][i];
      return sigmoid(sum);
    });
    // Dropout（只在訓練時）
    if (training) {
      this.dropMask = this.hidden.map(() => Math.random() > this.dropoutRate ? 1 : 0);
      this.hidden = this.hidden.map((h, i) => h * this.dropMask[i] / (1 - this.dropoutRate));
    }
    // 輸出層
    let out = this.b2[0];
    for (let j = 0; j < this.hidden.length; j++) out += this.hidden[j] * this.w2[0][j];
    return sigmoid(out);
  }

  l2Penalty() {
    let sum = 0;
    for (const row of this.w1) for (const w of row) sum += w * w;
    for (const row of this.w2) for (const w of row) sum += w * w;
    return this.lambda * sum;
  }
}

// 訓練並追蹤訓練/驗證損失
const net = new RegularizedNetwork(4, 8, 0.01, 0.3);
const lr = 0.5;
const trainLosses = [];
const valLosses = [];

for (let epoch = 0; epoch < 200; epoch++) {
  // 訓練
  let tLoss = 0;
  for (const d of trainData) {
    const pred = net.forward(d.x, true);
    const error = pred - d.y;
    tLoss += -d.y * Math.log(pred + 1e-8) - (1 - d.y) * Math.log(1 - pred + 1e-8);
    // 簡化的反向傳播更新
    const dOut = error;
    for (let j = 0; j < net.hidden.length; j++) {
      const dw2 = dOut * net.hidden[j] + 2 * net.lambda * net.w2[0][j];
      net.w2[0][j] -= lr * dw2;
      const dHidden = dOut * net.w2[0][j] * net.hidden[j] * (1 - net.hidden[j]);
      for (let i = 0; i < d.x.length; i++) {
        net.w1[j][i] -= lr * (dHidden * d.x[i] + 2 * net.lambda * net.w1[j][i]);
      }
      net.b1[j] -= lr * dHidden;
    }
    net.b2[0] -= lr * dOut;
  }
  tLoss = tLoss / trainData.length + net.l2Penalty();
  trainLosses.push(tLoss);

  // 驗證（不用 Dropout）
  let vLoss = 0;
  for (const d of valData) {
    const pred = net.forward(d.x, false);
    vLoss += -d.y * Math.log(pred + 1e-8) - (1 - d.y) * Math.log(1 - pred + 1e-8);
  }
  valLosses.push(vLoss / valData.length);

  if (epoch % 40 === 0) {
    console.log(\`Epoch \${epoch}: 訓練損失=\${tLoss.toFixed(4)}, 驗證損失=\${(vLoss/valData.length).toFixed(4)}\`);
  }
}

// 測試集評估
let correct = 0;
for (const d of testData) {
  const pred = net.forward(d.x, false);
  if (Math.round(pred) === d.y) correct++;
}
console.log(\`\\n測試集準確率: \${correct}/\${testData.length} = \${(correct/testData.length*100).toFixed(1)}%\`);`,
        steps: [
          {
            title: "步驟一：生成帶雜訊的資料",
            code: "function generateData(n) {\n  const data = [];\n  for (let i = 0; i < n; i++) {\n    const x = Math.random() * 4 - 2;\n    const noise = (Math.random() - 0.5) * 0.3;\n    const y = (x + noise) > 0 ? 1 : 0;\n    data.push({ x: [x, x * x, Math.sin(x), Math.random()], y });\n  }\n  return data;\n}",
            explanation: "我們刻意生成了含有雜訊和無關特徵的資料：\n\n• x 是真正有用的特徵\n• x² 和 sin(x) 是相關但冗餘的特徵\n• Math.random() 是完全無關的雜訊特徵\n\n一個好的模型應該學會依賴 x，而忽略隨機雜訊。過擬合的模型會試圖利用雜訊特徵來「記住」每筆資料。"
          },
          {
            title: "步驟二：分割資料集",
            code: "const allData = generateData(100);\nconst trainData = allData.slice(0, 70);\nconst valData = allData.slice(70, 85);\nconst testData = allData.slice(85);",
            explanation: "將 100 筆資料按 70/15/15 的比例分割：\n\n• 70 筆用來訓練（模型會反覆學習這些）\n• 15 筆用來驗證（訓練過程中監控過擬合）\n• 15 筆用來測試（最終評估）\n\n注意：驗證集和測試集的資料，模型在訓練時完全看不到。"
          },
          {
            title: "步驟三：Dropout 實作",
            code: "if (training) {\n  this.dropMask = this.hidden.map(() => Math.random() > this.dropoutRate ? 1 : 0);\n  this.hidden = this.hidden.map((h, i) => h * this.dropMask[i] / (1 - this.dropoutRate));\n}",
            explanation: "Dropout 的實作非常簡單：\n\n1. 生成一個隨機遮罩（mask），每個神經元有 dropoutRate 的機率被關閉\n2. 將隱藏層的輸出乘以遮罩（被關閉的神經元輸出變成 0）\n3. 除以 (1 - dropoutRate) 做「inverted dropout」——這樣測試時不需要調整\n\n注意 if (training) 這個條件：Dropout 只在訓練時啟用，測試時所有神經元都正常工作。"
          },
          {
            title: "步驟四：L2 正則化",
            code: "l2Penalty() {\n  let sum = 0;\n  for (const row of this.w1) for (const w of row) sum += w * w;\n  for (const row of this.w2) for (const w of row) sum += w * w;\n  return this.lambda * sum;\n}",
            explanation: "L2 正則化將所有權重的平方和加入損失函數：\n\n• 遍歷所有層的所有權重\n• 計算 w² 的總和\n• 乘以 lambda（正則化強度）\n\n在更新權重時，梯度中也要加上 2λw，這就是為什麼 L2 正則化又叫 weight decay（權重衰減）——每次更新都會讓權重稍微變小。"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 展示過擬合與正則化的完整範例
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function generateData(n) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 4 - 2;
    const noise = (Math.random() - 0.5) * 0.3;
    const y = (x + noise) > 0 ? 1 : 0;
    data.push({ x: [x, x * x, Math.sin(x), Math.random()], y });
  }
  return data;
}

const allData = generateData(100);
const trainData = allData.slice(0, 70);
const valData = allData.slice(70, 85);
const testData = allData.slice(85);

class RegularizedNetwork {
  constructor(inputSize, hiddenSize, lambda = 0.01, dropoutRate = 0.3) {
    this.lambda = lambda;
    this.dropoutRate = dropoutRate;
    const scale1 = Math.sqrt(2 / (inputSize + hiddenSize));
    const scale2 = Math.sqrt(2 / (hiddenSize + 1));
    this.w1 = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale1));
    this.b1 = new Array(hiddenSize).fill(0);
    this.w2 = Array.from({ length: 1 }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * scale2));
    this.b2 = [0];
  }

  forward(input, training = false) {
    this.hidden = this.b1.map((b, j) => {
      let sum = b;
      for (let i = 0; i < input.length; i++) sum += input[i] * this.w1[j][i];
      return sigmoid(sum);
    });
    if (training) {
      this.dropMask = this.hidden.map(() => Math.random() > this.dropoutRate ? 1 : 0);
      this.hidden = this.hidden.map((h, i) => h * this.dropMask[i] / (1 - this.dropoutRate));
    }
    let out = this.b2[0];
    for (let j = 0; j < this.hidden.length; j++) out += this.hidden[j] * this.w2[0][j];
    return sigmoid(out);
  }

  l2Penalty() {
    let sum = 0;
    for (const row of this.w1) for (const w of row) sum += w * w;
    for (const row of this.w2) for (const w of row) sum += w * w;
    return this.lambda * sum;
  }
}

const net = new RegularizedNetwork(4, 8, 0.01, 0.3);
const lr = 0.5;
for (let epoch = 0; epoch < 200; epoch++) {
  let tLoss = 0;
  for (const d of trainData) {
    const pred = net.forward(d.x, true);
    const error = pred - d.y;
    tLoss += -d.y * Math.log(pred + 1e-8) - (1 - d.y) * Math.log(1 - pred + 1e-8);
    const dOut = error;
    for (let j = 0; j < net.hidden.length; j++) {
      net.w2[0][j] -= lr * (dOut * net.hidden[j] + 2 * net.lambda * net.w2[0][j]);
      const dH = dOut * net.w2[0][j] * net.hidden[j] * (1 - net.hidden[j]);
      for (let i = 0; i < d.x.length; i++) {
        net.w1[j][i] -= lr * (dH * d.x[i] + 2 * net.lambda * net.w1[j][i]);
      }
      net.b1[j] -= lr * dH;
    }
    net.b2[0] -= lr * dOut;
  }
  tLoss = tLoss / trainData.length + net.l2Penalty();
  let vLoss = 0;
  for (const d of valData) {
    const pred = net.forward(d.x, false);
    vLoss += -d.y * Math.log(pred + 1e-8) - (1 - d.y) * Math.log(1 - pred + 1e-8);
  }
  if (epoch % 40 === 0) {
    console.log(\`Epoch \${epoch}: 訓練損失=\${tLoss.toFixed(4)}, 驗證損失=\${(vLoss/valData.length).toFixed(4)}\`);
  }
}

let correct = 0;
for (const d of testData) {
  const pred = net.forward(d.x, false);
  if (Math.round(pred) === d.y) correct++;
}
console.log(\`\\n測試集準確率: \${correct}/\${testData.length} = \${(correct/testData.length*100).toFixed(1)}%\`);`,
        explanation: "這個範例展示了完整的過擬合防治流程：資料分割為訓練/驗證/測試集，使用 L2 正則化懲罰大權重，Dropout 隨機關閉神經元。觀察訓練損失和驗證損失的變化趨勢。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "當訓練損失持續下降，但驗證損失開始上升時，這代表什麼？",
          options: [
            "模型正在正常學習",
            "模型發生了過擬合",
            "學習率太小",
            "資料集太大",
          ],
          correct: 1,
          explanation: "訓練損失下降但驗證損失上升是過擬合的典型信號。這代表模型正在「記住」訓練資料的細節（包括雜訊），而不是學習真正的規律，所以在沒見過的驗證資料上表現變差了。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Dropout 為什麼只在訓練時使用，測試時不使用？",
          options: [
            "因為測試時不需要計算",
            "因為測試時我們想用所有神經元來做最好的預測",
            "因為測試時沒有正確答案",
            "因為 Dropout 會讓測試變慢",
          ],
          correct: 1,
          explanation: "訓練時 Dropout 是為了防止過擬合，讓每個神經元都學到有用的特徵。但測試時，我們要做最準確的預測，所以讓所有神經元都參與工作，充分利用模型學到的全部知識。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "L2 正則化的核心思想是什麼？",
          options: [
            "增加更多訓練資料",
            "懲罰過大的權重，讓模型保持簡單",
            "減少神經網路的層數",
            "增加學習率",
          ],
          correct: 1,
          explanation: "L2 正則化在損失函數中加入權重平方和的懲罰項。這迫使模型保持較小的權重值，避免對個別特徵過度依賴，從而降低過擬合的風險。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 L2 正則化損失",
          description: "請實作一個 l2Loss 函數，接收原始損失值 originalLoss、權重矩陣 weights（二維陣列）和正則化強度 lambda，回傳加上 L2 懲罰項的總損失。\n\n公式：totalLoss = originalLoss + lambda * Σ(w²)",
          starterCode: `// 請實作 l2Loss 函數
function l2Loss(originalLoss, weights, lambda) {
  // TODO: 計算所有權重的平方和
  // TODO: 回傳 originalLoss + lambda * 平方和
}

// 測試
const weights1 = [[0.5, -0.3], [0.8, 0.1]];
console.log(l2Loss(1.0, weights1, 0.1));
console.log(l2Loss(0.5, [[1, 2], [3, 4]], 0.01));
console.log(l2Loss(2.0, [[0, 0], [0, 0]], 0.1));`,
          solution: `function l2Loss(originalLoss, weights, lambda) {
  let sumSquares = 0;
  for (const row of weights) {
    for (const w of row) {
      sumSquares += w * w;
    }
  }
  return originalLoss + lambda * sumSquares;
}

const weights1 = [[0.5, -0.3], [0.8, 0.1]];
console.log(l2Loss(1.0, weights1, 0.1));
console.log(l2Loss(0.5, [[1, 2], [3, 4]], 0.01));
console.log(l2Loss(2.0, [[0, 0], [0, 0]], 0.1));`,
          testCases: [
            { input: "console.log(l2Loss(1.0, [[0.5, -0.3], [0.8, 0.1]], 0.1))", expected: "1.099" },
            { input: "console.log(l2Loss(0.5, [[1, 2], [3, 4]], 0.01))", expected: "0.8" },
            { input: "console.log(l2Loss(2.0, [[0, 0], [0, 0]], 0.1))", expected: "2" },
          ],
          hints: [
            "用兩層 for 迴圈遍歷二維陣列中的每個權重",
            "將每個權重平方（w * w）後加總",
            "最後回傳 originalLoss + lambda * sumSquares",
          ],
        },
      },
    ],
    prevChapter: 7,
    nextChapter: 9,
  },
  // ============================================================
  // Chapter 9
  // ============================================================
  {
    id: 9,
    title: "進階優化器",
    subtitle: "比基本梯度下降更聰明的訓練方法",
    icon: "🚀",
    sections: [
      {
        type: "text",
        content: `## 基本梯度下降的問題

在前面的章節中，我們一直使用「vanilla」梯度下降：

\`w = w - learning_rate × gradient\`

雖然簡單有效，但它有幾個嚴重的問題：

### 1. 震盪問題
想像你在一個狹長的山谷中下山。梯度下降會在山谷的兩側來回彈跳（震盪），而不是沿著谷底直接走向最低點。這導致收斂速度非常慢。

### 2. 學習率兩難
- **學習率太大**：步伐太大，可能越過最低點，甚至發散
- **學習率太小**：步伐太小，訓練非常緩慢
- 不同的參數可能需要不同的學習率

### 3. 局部最小值和鞍點
梯度下降可能會卡在局部最小值（不是全域最低的低谷）或鞍點（在某些方向是最低點，但其他方向不是）。

### 解決方案：更聰明的優化器

接下來我們會學習三個改進版的優化器：**Momentum**、**RMSprop** 和 **Adam**。`,
      },
      {
        type: "text",
        content: `## Momentum（動量）

### 靈感來源：滾球下山

想像一顆球從山上滾下來。它不是每一步都重新決定方向，而是會累積速度——如果一直朝同一個方向，就會越滾越快；如果方向改變，速度會先減緩。

### 數學公式

\`v = β × v_prev + gradient\`
\`w = w - learning_rate × v\`

- **v** 是「速度」（velocity），記錄了之前梯度的累積方向
- **β** 是動量係數（通常 0.9），控制「記憶」多少歷史梯度

### 為什麼有效？
- 在一致的方向上加速（像球滾下坡越來越快）
- 在震盪的方向上抵消（來回彈跳的梯度會互相抵消）
- 有機會越過小的局部最小值

## RMSprop（Root Mean Square Propagation）

### 核心思想：自適應學習率

不同的參數可能需要不同大小的學習率。RMSprop 為每個參數自動調整學習率。

### 數學公式

\`s = β × s_prev + (1-β) × gradient²\`
\`w = w - learning_rate × gradient / √(s + ε)\`

- **s** 記錄了梯度平方的移動平均
- 如果某個參數的梯度一直很大，s 就大，學習率就自動變小
- 如果梯度一直很小，s 就小，學習率就自動變大
- **ε**（epsilon，通常 1e-8）防止除以零

## Adam（Adaptive Moment Estimation）

### 最佳組合：Momentum + RMSprop

Adam 是目前最流行的優化器，它結合了 Momentum 和 RMSprop 的優點：

\`m = β₁ × m_prev + (1-β₁) × gradient\`（一階矩：方向）
\`v = β₂ × v_prev + (1-β₂) × gradient²\`（二階矩：大小）
\`m̂ = m / (1 - β₁ᵗ)\`（偏差修正）
\`v̂ = v / (1 - β₂ᵗ)\`（偏差修正）
\`w = w - learning_rate × m̂ / √(v̂ + ε)\`

預設參數：β₁ = 0.9, β₂ = 0.999, ε = 1e-8

### 為什麼 Adam 最受歡迎？
- 結合了方向累積（Momentum）和大小自適應（RMSprop）
- 偏差修正讓訓練初期也很穩定
- 幾乎不需要調整超參數，預設值就很好用`,
      },
      {
        type: "text",
        content: `## 批次訓練策略

除了優化器本身，**如何餵資料**也很重要：

### 1. 批次梯度下降（Batch GD）
- 每次用 **全部** 訓練資料計算梯度
- 優點：穩定、收斂方向正確
- 缺點：非常慢，特別是資料量大時

### 2. 隨機梯度下降（Stochastic GD, SGD）
- 每次只用 **一筆** 資料計算梯度
- 優點：快速、有隨機性可以跳出局部最小值
- 缺點：很不穩定，震盪嚴重

### 3. 小批次梯度下降（Mini-batch GD）⭐
- 每次用 **一小批**（通常 32-256 筆）資料計算梯度
- 優點：兼顧速度和穩定性
- 這是實務中最常用的方法！

### 學習率排程（Learning Rate Scheduling）

訓練過程中動態調整學習率：

- **開始時用較大的學習率**：快速接近最優解
- **後期用較小的學習率**：精細調整，避免越過最優解

常見方法：
- **階梯衰減**：每隔 N 個 epoch 乘以 0.1
- **指數衰減**：lr = lr₀ × e^(-decay × epoch)
- **餘弦退火**：lr 按餘弦曲線變化`,
      },
      {
        type: "code-step",
        content: `// 實作並比較三種優化器
function sigmoid(x) { return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); }

// 簡單的優化問題：學習 XOR
const xorData = [
  { input: [0, 0], target: 0 },
  { input: [0, 1], target: 1 },
  { input: [1, 0], target: 1 },
  { input: [1, 1], target: 0 },
];

class MiniNetwork {
  constructor() { this.reset(); }
  reset() {
    // 固定隨機種子效果：使用固定初始值
    this.w1 = [[0.5, -0.3], [-0.2, 0.8], [0.4, -0.6], [0.7, 0.1]];
    this.b1 = [0.1, -0.1, 0.2, -0.2];
    this.w2 = [[0.3, -0.5, 0.2, 0.4]];
    this.b2 = [0.1];
  }
  forward(input) {
    this.h = this.b1.map((b, j) => {
      let s = b;
      for (let i = 0; i < input.length; i++) s += input[i] * this.w1[j][i];
      return sigmoid(s);
    });
    let out = this.b2[0];
    for (let j = 0; j < this.h.length; j++) out += this.h[j] * this.w2[0][j];
    return sigmoid(out);
  }
  getGradients(input, target) {
    const pred = this.forward(input);
    const dOut = pred - target;
    const gw2 = this.h.map(h => dOut * h);
    const gb2 = dOut;
    const gw1 = this.w1.map((row, j) => row.map((_, i) => {
      return dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]) * input[i];
    }));
    const gb1 = this.b1.map((_, j) => dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]));
    return { gw1, gb1, gw2, gb2, loss: -target * Math.log(pred + 1e-8) - (1 - target) * Math.log(1 - pred + 1e-8) };
  }
}

// === 1. Vanilla SGD ===
function trainSGD(epochs, lr) {
  const net = new MiniNetwork();
  const losses = [];
  for (let e = 0; e < epochs; e++) {
    let totalLoss = 0;
    for (const d of xorData) {
      const g = net.getGradients(d.input, d.target);
      totalLoss += g.loss;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 2; i++) net.w1[j][i] -= lr * g.gw1[j][i];
        net.b1[j] -= lr * g.gb1[j];
        net.w2[0][j] -= lr * g.gw2[j];
      }
      net.b2[0] -= lr * g.gb2;
    }
    if (e % 200 === 0) losses.push(totalLoss / 4);
  }
  return losses;
}

// === 2. Momentum SGD ===
function trainMomentum(epochs, lr, beta = 0.9) {
  const net = new MiniNetwork();
  // 初始化速度為 0
  let vw1 = net.w1.map(r => r.map(() => 0));
  let vb1 = net.b1.map(() => 0);
  let vw2 = [net.w2[0].map(() => 0)];
  let vb2 = [0];
  const losses = [];
  for (let e = 0; e < epochs; e++) {
    let totalLoss = 0;
    for (const d of xorData) {
      const g = net.getGradients(d.input, d.target);
      totalLoss += g.loss;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 2; i++) {
          vw1[j][i] = beta * vw1[j][i] + g.gw1[j][i];
          net.w1[j][i] -= lr * vw1[j][i];
        }
        vb1[j] = beta * vb1[j] + g.gb1[j];
        net.b1[j] -= lr * vb1[j];
        vw2[0][j] = beta * vw2[0][j] + g.gw2[j];
        net.w2[0][j] -= lr * vw2[0][j];
      }
      vb2[0] = beta * vb2[0] + g.gb2;
      net.b2[0] -= lr * vb2[0];
    }
    if (e % 200 === 0) losses.push(totalLoss / 4);
  }
  return losses;
}

// === 3. Adam ===
function trainAdam(epochs, lr = 0.01, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
  const net = new MiniNetwork();
  let mw1 = net.w1.map(r => r.map(() => 0));
  let vw1 = net.w1.map(r => r.map(() => 0));
  let mb1 = net.b1.map(() => 0), vvb1 = net.b1.map(() => 0);
  let mw2 = [net.w2[0].map(() => 0)], vw2o = [net.w2[0].map(() => 0)];
  let mb2 = [0], vvb2 = [0];
  let t = 0;
  const losses = [];
  for (let e = 0; e < epochs; e++) {
    let totalLoss = 0;
    for (const d of xorData) {
      t++;
      const g = net.getGradients(d.input, d.target);
      totalLoss += g.loss;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 2; i++) {
          mw1[j][i] = beta1 * mw1[j][i] + (1 - beta1) * g.gw1[j][i];
          vw1[j][i] = beta2 * vw1[j][i] + (1 - beta2) * g.gw1[j][i] * g.gw1[j][i];
          const mHat = mw1[j][i] / (1 - Math.pow(beta1, t));
          const vHat = vw1[j][i] / (1 - Math.pow(beta2, t));
          net.w1[j][i] -= lr * mHat / (Math.sqrt(vHat) + eps);
        }
        mb1[j] = beta1 * mb1[j] + (1 - beta1) * g.gb1[j];
        vvb1[j] = beta2 * vvb1[j] + (1 - beta2) * g.gb1[j] * g.gb1[j];
        net.b1[j] -= lr * (mb1[j] / (1 - Math.pow(beta1, t))) / (Math.sqrt(vvb1[j] / (1 - Math.pow(beta2, t))) + eps);
        mw2[0][j] = beta1 * mw2[0][j] + (1 - beta1) * g.gw2[j];
        vw2o[0][j] = beta2 * vw2o[0][j] + (1 - beta2) * g.gw2[j] * g.gw2[j];
        net.w2[0][j] -= lr * (mw2[0][j] / (1 - Math.pow(beta1, t))) / (Math.sqrt(vw2o[0][j] / (1 - Math.pow(beta2, t))) + eps);
      }
      mb2[0] = beta1 * mb2[0] + (1 - beta1) * g.gb2;
      vvb2[0] = beta2 * vvb2[0] + (1 - beta2) * g.gb2 * g.gb2;
      net.b2[0] -= lr * (mb2[0] / (1 - Math.pow(beta1, t))) / (Math.sqrt(vvb2[0] / (1 - Math.pow(beta2, t))) + eps);
    }
    if (e % 200 === 0) losses.push(totalLoss / 4);
  }
  return losses;
}

// 比較三種方法
const epochs = 2000;
console.log("=== 優化器比較（XOR 問題）===\\n");
const sgdLoss = trainSGD(epochs, 0.5);
const momLoss = trainMomentum(epochs, 0.5, 0.9);
const adamLoss = trainAdam(epochs, 0.01);

console.log("Epoch |  SGD    | Momentum | Adam");
console.log("------|---------|----------|--------");
for (let i = 0; i < sgdLoss.length; i++) {
  console.log(\`\${(i*200).toString().padStart(5)} | \${sgdLoss[i].toFixed(4).padStart(7)} | \${momLoss[i].toFixed(4).padStart(8)} | \${adamLoss[i].toFixed(4)}\`);
}`,
        steps: [
          {
            title: "步驟一：建立基礎網路和梯度計算",
            code: "getGradients(input, target) {\n  const pred = this.forward(input);\n  const dOut = pred - target;\n  const gw2 = this.h.map(h => dOut * h);\n  const gb2 = dOut;\n  const gw1 = this.w1.map((row, j) => row.map((_, i) => {\n    return dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]) * input[i];\n  }));\n  const gb1 = this.b1.map((_, j) => dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]));\n  return { gw1, gb1, gw2, gb2, loss: ... };\n}",
            explanation: "所有優化器都需要梯度。getGradients 函數：\n\n1. 前向傳播得到預測值\n2. 計算輸出誤差 dOut\n3. 反向傳播計算每個權重的梯度\n4. 回傳所有梯度和損失值\n\n三種優化器的差別不在於「如何計算梯度」，而在於「如何利用梯度來更新權重」。"
          },
          {
            title: "步驟二：Vanilla SGD",
            code: "// Vanilla SGD — 直接用梯度更新\nnet.w1[j][i] -= lr * g.gw1[j][i];",
            explanation: "最基本的梯度下降：直接用梯度乘以學習率來更新權重。\n\n簡單直接，但容易震盪、收斂慢。"
          },
          {
            title: "步驟三：Momentum SGD",
            code: "// Momentum — 累積歷史梯度方向\nvw1[j][i] = beta * vw1[j][i] + g.gw1[j][i];\nnet.w1[j][i] -= lr * vw1[j][i];",
            explanation: "Momentum 加入了「速度」變數 v：\n\n• v = 0.9 × 上次的速度 + 這次的梯度\n• beta = 0.9 表示保留 90% 的歷史慣性\n\n效果：在一致的方向上加速（像球滾下坡），在震盪的方向上減速（來回的梯度互相抵消）。"
          },
          {
            title: "步驟四：Adam 優化器",
            code: "// Adam — 結合方向(m)和大小(v)的自適應\nmw1[j][i] = beta1 * mw1[j][i] + (1 - beta1) * g.gw1[j][i];\nvw1[j][i] = beta2 * vw1[j][i] + (1 - beta2) * g.gw1[j][i] * g.gw1[j][i];\nconst mHat = mw1[j][i] / (1 - Math.pow(beta1, t));\nconst vHat = vw1[j][i] / (1 - Math.pow(beta2, t));\nnet.w1[j][i] -= lr * mHat / (Math.sqrt(vHat) + eps);",
            explanation: "Adam 結合了兩個概念：\n\n1. m（一階矩）= 梯度的移動平均 → 像 Momentum，記住方向\n2. v（二階矩）= 梯度平方的移動平均 → 像 RMSprop，自適應大小\n3. 偏差修正：除以 (1 - βᵗ) 修正初期的偏差\n4. 最終更新：方向 / √(大小) → 自動調整每個參數的學習率\n\nAdam 幾乎是萬能的——預設參數在大多數問題上都表現很好。"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 實作並比較三種優化器
function sigmoid(x) { return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); }

const xorData = [
  { input: [0, 0], target: 0 },
  { input: [0, 1], target: 1 },
  { input: [1, 0], target: 1 },
  { input: [1, 1], target: 0 },
];

class MiniNetwork {
  constructor() { this.reset(); }
  reset() {
    this.w1 = [[0.5, -0.3], [-0.2, 0.8], [0.4, -0.6], [0.7, 0.1]];
    this.b1 = [0.1, -0.1, 0.2, -0.2];
    this.w2 = [[0.3, -0.5, 0.2, 0.4]];
    this.b2 = [0.1];
  }
  forward(input) {
    this.h = this.b1.map((b, j) => {
      let s = b;
      for (let i = 0; i < input.length; i++) s += input[i] * this.w1[j][i];
      return sigmoid(s);
    });
    let out = this.b2[0];
    for (let j = 0; j < this.h.length; j++) out += this.h[j] * this.w2[0][j];
    return sigmoid(out);
  }
  getGradients(input, target) {
    const pred = this.forward(input);
    const dOut = pred - target;
    const gw2 = this.h.map(h => dOut * h);
    const gb2 = dOut;
    const gw1 = this.w1.map((row, j) => row.map((_, i) =>
      dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]) * input[i]));
    const gb1 = this.b1.map((_, j) =>
      dOut * this.w2[0][j] * this.h[j] * (1 - this.h[j]));
    return { gw1, gb1, gw2, gb2, loss: -target * Math.log(pred + 1e-8) - (1 - target) * Math.log(1 - pred + 1e-8) };
  }
}

// SGD
function trainSGD(epochs, lr) {
  const net = new MiniNetwork();
  const losses = [];
  for (let e = 0; e < epochs; e++) {
    let tl = 0;
    for (const d of xorData) {
      const g = net.getGradients(d.input, d.target);
      tl += g.loss;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 2; i++) net.w1[j][i] -= lr * g.gw1[j][i];
        net.b1[j] -= lr * g.gb1[j];
        net.w2[0][j] -= lr * g.gw2[j];
      }
      net.b2[0] -= lr * g.gb2;
    }
    if (e % 200 === 0) losses.push(tl / 4);
  }
  return losses;
}

// Adam
function trainAdam(epochs, lr = 0.01) {
  const net = new MiniNetwork();
  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
  let mw1 = net.w1.map(r => r.map(() => 0)), vw1 = net.w1.map(r => r.map(() => 0));
  let mb1 = net.b1.map(() => 0), vb1 = net.b1.map(() => 0);
  let mw2 = [net.w2[0].map(() => 0)], vw2 = [net.w2[0].map(() => 0)];
  let mb2 = [0], vb2 = [0];
  let t = 0;
  const losses = [];
  for (let e = 0; e < epochs; e++) {
    let tl = 0;
    for (const d of xorData) {
      t++;
      const g = net.getGradients(d.input, d.target);
      tl += g.loss;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 2; i++) {
          mw1[j][i] = beta1 * mw1[j][i] + (1 - beta1) * g.gw1[j][i];
          vw1[j][i] = beta2 * vw1[j][i] + (1 - beta2) * g.gw1[j][i] ** 2;
          net.w1[j][i] -= lr * (mw1[j][i] / (1 - beta1 ** t)) / (Math.sqrt(vw1[j][i] / (1 - beta2 ** t)) + eps);
        }
        mb1[j] = beta1 * mb1[j] + (1 - beta1) * g.gb1[j];
        vb1[j] = beta2 * vb1[j] + (1 - beta2) * g.gb1[j] ** 2;
        net.b1[j] -= lr * (mb1[j] / (1 - beta1 ** t)) / (Math.sqrt(vb1[j] / (1 - beta2 ** t)) + eps);
        mw2[0][j] = beta1 * mw2[0][j] + (1 - beta1) * g.gw2[j];
        vw2[0][j] = beta2 * vw2[0][j] + (1 - beta2) * g.gw2[j] ** 2;
        net.w2[0][j] -= lr * (mw2[0][j] / (1 - beta1 ** t)) / (Math.sqrt(vw2[0][j] / (1 - beta2 ** t)) + eps);
      }
      mb2[0] = beta1 * mb2[0] + (1 - beta1) * g.gb2;
      vb2[0] = beta2 * vb2[0] + (1 - beta2) * g.gb2 ** 2;
      net.b2[0] -= lr * (mb2[0] / (1 - beta1 ** t)) / (Math.sqrt(vb2[0] / (1 - beta2 ** t)) + eps);
    }
    if (e % 200 === 0) losses.push(tl / 4);
  }
  return losses;
}

const sgdLoss = trainSGD(2000, 0.5);
const adamLoss = trainAdam(2000, 0.01);

console.log("Epoch |  SGD    |  Adam");
console.log("------|---------|--------");
for (let i = 0; i < sgdLoss.length; i++) {
  console.log(\`\${(i*200).toString().padStart(5)} | \${sgdLoss[i].toFixed(4).padStart(7)} | \${adamLoss[i].toFixed(4)}\`);
}`,
        explanation: "這段程式碼比較了 vanilla SGD 和 Adam 優化器在 XOR 問題上的訓練速度。觀察損失下降的速度差異——Adam 通常會更快收斂且更穩定。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Momentum 優化器中的「速度」變數 v 的作用是什麼？",
          options: [
            "加快程式的執行速度",
            "累積歷史梯度方向，在一致方向上加速，在震盪方向上減速",
            "限制權重的最大值",
            "自動調整網路的層數",
          ],
          correct: 1,
          explanation: "Momentum 的速度變數 v 保存了歷史梯度的累積方向。如果梯度一直指向同一方向，v 會越來越大（加速）；如果梯度來回震盪，正負梯度會互相抵消（減速）。這就像球滾下坡時會累積動量。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Adam 優化器為什麼需要「偏差修正」（除以 1 - β^t）？",
          options: [
            "為了讓程式跑得更快",
            "因為初始時 m 和 v 都是 0，直接使用會偏小，偏差修正讓初期估計更準確",
            "為了防止權重變成負數",
            "為了減少記憶體使用",
          ],
          correct: 1,
          explanation: "m 和 v 初始化為 0，在訓練初期（t 很小時），移動平均值會偏向 0。例如 t=1 時，m = 0.1 × gradient，遠小於真實梯度。偏差修正 m/(1-β₁¹) = m/0.1 把它放大回合理的範圍。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Mini-batch 梯度下降相比於完整批次和隨機梯度下降的優勢是什麼？",
          options: [
            "完全不需要計算梯度",
            "兼顧計算效率和收斂穩定性",
            "不需要設定學習率",
            "可以跳過所有局部最小值",
          ],
          correct: 1,
          explanation: "Mini-batch 是批次（穩定但慢）和隨機（快但不穩定）的折衷方案。用一小批資料（32-256 筆）計算梯度，既比完整批次快很多，又比單筆資料穩定得多。這是實務中最常用的方法。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 Momentum SGD",
          description: "請實作一個 momentumUpdate 函數，接收當前權重 w、當前速度 v、梯度 gradient、學習率 lr 和動量係數 beta，回傳更新後的 { w, v }。\n\n公式：\nv_new = beta * v + gradient\nw_new = w - lr * v_new",
          starterCode: `// 請實作 momentumUpdate 函數
function momentumUpdate(w, v, gradient, lr, beta) {
  // TODO: 計算新的速度 v_new
  // TODO: 計算新的權重 w_new
  // TODO: 回傳 { w: w_new, v: v_new }
}

// 測試
console.log(JSON.stringify(momentumUpdate(1.0, 0, 0.5, 0.1, 0.9)));
console.log(JSON.stringify(momentumUpdate(1.0, 0.5, 0.3, 0.1, 0.9)));
console.log(JSON.stringify(momentumUpdate(2.0, -0.2, 0.1, 0.01, 0.9)));`,
          solution: `function momentumUpdate(w, v, gradient, lr, beta) {
  const v_new = beta * v + gradient;
  const w_new = w - lr * v_new;
  return { w: w_new, v: v_new };
}

console.log(JSON.stringify(momentumUpdate(1.0, 0, 0.5, 0.1, 0.9)));
console.log(JSON.stringify(momentumUpdate(1.0, 0.5, 0.3, 0.1, 0.9)));
console.log(JSON.stringify(momentumUpdate(2.0, -0.2, 0.1, 0.01, 0.9)));`,
          testCases: [
            { input: "console.log(JSON.stringify(momentumUpdate(1.0, 0, 0.5, 0.1, 0.9)))", expected: '{"w":0.95,"v":0.5}' },
            { input: "console.log(JSON.stringify(momentumUpdate(1.0, 0.5, 0.3, 0.1, 0.9)))", expected: '{"w":0.925,"v":0.75}' },
            { input: "console.log(JSON.stringify(momentumUpdate(2.0, -0.2, 0.1, 0.01, 0.9)))", expected: '{"w":1.9992,"v":-0.08}' },
          ],
          hints: [
            "先計算 v_new = beta * v + gradient",
            "再計算 w_new = w - lr * v_new",
            "回傳一個物件 { w: w_new, v: v_new }",
          ],
        },
      },
    ],
    prevChapter: 8,
    nextChapter: 10,
  },
  // ============================================================
  // Chapter 10
  // ============================================================
  {
    id: 10,
    title: "卷積神經網路 (CNN)",
    subtitle: "專為圖像設計的神經網路架構",
    icon: "🖼️",
    sections: [
      {
        type: "text",
        content: `## 為什麼圖像需要特殊的網路？

在前面的章節中，我們使用的都是「全連接網路」——每個神經元和下一層的每個神經元都相連。但處理圖像時，這種方式有嚴重的問題：

### 參數爆炸

一張小小的 28×28 灰度圖片有 784 個像素。如果第一個隱藏層有 256 個神經元：
- 全連接需要 784 × 256 = **200,704 個參數**
- 如果是 1000×1000 的彩色圖片（3 個通道）？3,000,000 × 256 = **7.68 億個參數！**

這不僅需要巨大的記憶體，還非常容易過擬合。

### 忽略空間結構

圖像中相鄰的像素之間有很強的關聯性。一隻貓的耳朵是由附近的像素共同組成的。但全連接網路把所有像素「攤平」成一維向量，完全丟失了空間信息。

### CNN 的解決方案

卷積神經網路（CNN）用三個關鍵概念解決了這些問題：
1. **卷積核（Filter）**：只看圖像的一小塊區域
2. **參數共享**：同一個卷積核在整張圖上滑動使用
3. **池化（Pooling）**：逐步縮小圖像尺寸`,
      },
      {
        type: "diagram",
        content: "cnn-architecture",
        diagram: "cnn-architecture",
        caption: "CNN 典型架構：輸入影像 → 卷積層 → 池化層 → ... → 展平 → 全連接層 → 輸出",
      },
      {
        type: "text",
        content: `## 卷積操作

### 直覺理解

想像你用一個放大鏡看一張圖片。你不是一次看整張圖，而是：
1. 把放大鏡放在左上角，看一小塊區域
2. 記錄你看到的特徵（比如「這裡有一條邊緣」）
3. 把放大鏡往右移一格，繼續看
4. 重複直到掃完整張圖

這個「放大鏡」就是 **卷積核（Kernel / Filter）**，通常是 3×3 或 5×5 的小矩陣。

### 卷積運算

卷積核在圖像上滑動，在每個位置做「逐元素相乘再求和」：

\`\`\`
圖像區塊:     卷積核:        結果:
[1 2 3]     [1  0 -1]
[4 5 6]  ×  [1  0 -1]  = 1×1 + 2×0 + 3×(-1) + 4×1 + 5×0 + 6×(-1) + 7×1 + 8×0 + 9×(-1) = -6
[7 8 9]     [1  0 -1]
\`\`\`

### 常見的卷積核效果

- **邊緣偵測**（垂直）：\`[[-1,0,1],[-1,0,1],[-1,0,1]]\` → 找到左右亮度變化大的地方
- **邊緣偵測**（水平）：\`[[-1,-1,-1],[0,0,0],[1,1,1]]\` → 找到上下亮度變化大的地方
- **模糊**：\`[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]\` → 取周圍像素的平均
- **銳化**：\`[[0,-1,0],[-1,5,-1],[0,-1,0]]\` → 強化中心像素與周圍的差異

### Padding（填充）和 Stride（步幅）

- **Padding**：在圖像邊緣補零。\`same\` padding 讓輸出和輸入大小相同
- **Stride**：卷積核每次移動的步數。stride=2 會讓輸出大小減半

### 輸出大小公式

\`output_size = (input_size - kernel_size + 2 × padding) / stride + 1\`

例如：28×28 的圖，3×3 的核，padding=1，stride=1：
(28 - 3 + 2) / 1 + 1 = 28（大小不變！）`,
      },
      {
        type: "text",
        content: `## 池化層（Pooling）

卷積後的特徵圖通常還是很大。池化層的作用是 **縮小尺寸**，同時保留最重要的信息。

### 最大池化（Max Pooling）

在每個小區域中取最大值。例如 2×2 的 max pooling：

\`\`\`
[1  3 | 2  4]        [3  4]
[5  2 | 6  1]  →     [5  8]
[3  5 | 7  8]
[4  1 | 3  2]
\`\`\`

**為什麼取最大值？** 如果卷積核偵測到了某個特徵（比如邊緣），那個位置的值會很大。Max pooling 保留了「這個區域有沒有這個特徵」的信息，同時丟掉了精確位置——這其實是好事！因為我們不需要知道邊緣在第 5 列還是第 6 列，只需要知道「這個區域有邊緣」。

### 平均池化（Average Pooling）
取區域內的平均值。比 max pooling 更平滑，但不太常用。

## 完整 CNN 架構

一個典型的 CNN 長這樣：

**輸入 → [卷積 → ReLU → 池化] × N → 攤平 → 全連接 → 輸出**

1. **卷積層**：提取局部特徵（邊緣、紋理、形狀…）
2. **ReLU**：引入非線性
3. **池化層**：縮小尺寸，保留重要特徵
4. 重複 1-3 幾次，每次提取更抽象的特徵
5. **攤平（Flatten）**：把 2D 特徵圖拉成 1D 向量
6. **全連接層**：最後的分類/回歸

### 參數共享的威力

假設輸入是 28×28，使用 16 個 3×3 的卷積核：
- 參數數量：16 × (3 × 3 + 1) = **160 個**（+1 是偏差）
- 對比全連接：784 × 16 = **12,544 個**

少了 **80 倍**！而且卷積核學到的特徵（比如邊緣偵測器）可以在圖像的任何位置重複使用。`,
      },
      {
        type: "code-step",
        content: `// 從零實作 2D 卷積操作
function conv2d(input, kernel, stride = 1, padding = 0) {
  const inputH = input.length;
  const inputW = input[0].length;
  const kernelH = kernel.length;
  const kernelW = kernel[0].length;

  // 加上 padding
  let padded = input;
  if (padding > 0) {
    const pH = inputH + 2 * padding;
    const pW = inputW + 2 * padding;
    padded = Array.from({ length: pH }, () => new Array(pW).fill(0));
    for (let i = 0; i < inputH; i++) {
      for (let j = 0; j < inputW; j++) {
        padded[i + padding][j + padding] = input[i][j];
      }
    }
  }

  // 計算輸出大小
  const outH = Math.floor((padded.length - kernelH) / stride) + 1;
  const outW = Math.floor((padded[0].length - kernelW) / stride) + 1;
  const output = Array.from({ length: outH }, () => new Array(outW).fill(0));

  // 卷積運算
  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelH; ki++) {
        for (let kj = 0; kj < kernelW; kj++) {
          sum += padded[i * stride + ki][j * stride + kj] * kernel[ki][kj];
        }
      }
      output[i][j] = sum;
    }
  }
  return output;
}

// Max Pooling
function maxPool2d(input, poolSize = 2, stride = 2) {
  const outH = Math.floor((input.length - poolSize) / stride) + 1;
  const outW = Math.floor((input[0].length - poolSize) / stride) + 1;
  const output = Array.from({ length: outH }, () => new Array(outW).fill(0));

  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let maxVal = -Infinity;
      for (let pi = 0; pi < poolSize; pi++) {
        for (let pj = 0; pj < poolSize; pj++) {
          maxVal = Math.max(maxVal, input[i * stride + pi][j * stride + pj]);
        }
      }
      output[i][j] = maxVal;
    }
  }
  return output;
}

// ReLU
function relu2d(input) {
  return input.map(row => row.map(v => Math.max(0, v)));
}

// 測試：模擬一個簡單的 CNN
// 6×6 的「圖像」
const image = [
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
];

// 垂直邊緣偵測卷積核
const edgeKernel = [
  [-1, 0, 1],
  [-1, 0, 1],
  [-1, 0, 1],
];

console.log("=== 原始圖像 (6×6) ===");
image.forEach(row => console.log(row.map(v => v.toString().padStart(2)).join(" ")));

const convResult = conv2d(image, edgeKernel);
console.log("\\n=== 卷積後 (邊緣偵測) ===");
convResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));

const reluResult = relu2d(convResult);
console.log("\\n=== ReLU 後 ===");
reluResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));

const poolResult = maxPool2d(reluResult);
console.log("\\n=== Max Pooling 後 (2×2) ===");
poolResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));`,
        steps: [
          {
            title: "步驟一：實作 2D 卷積",
            code: "for (let i = 0; i < outH; i++) {\n  for (let j = 0; j < outW; j++) {\n    let sum = 0;\n    for (let ki = 0; ki < kernelH; ki++) {\n      for (let kj = 0; kj < kernelW; kj++) {\n        sum += padded[i * stride + ki][j * stride + kj] * kernel[ki][kj];\n      }\n    }\n    output[i][j] = sum;\n  }\n}",
            explanation: "卷積操作的核心是四層迴圈：\n\n• 外兩層 (i, j)：遍歷輸出的每個位置\n• 內兩層 (ki, kj)：在每個位置，用卷積核覆蓋對應的輸入區域\n\n在每個位置，把卷積核和覆蓋區域逐元素相乘再求和。stride 控制每次移動的步數，stride=2 表示每次跳兩格。"
          },
          {
            title: "步驟二：Padding（填充）",
            code: "if (padding > 0) {\n  const pH = inputH + 2 * padding;\n  const pW = inputW + 2 * padding;\n  padded = Array.from({ length: pH }, () => new Array(pW).fill(0));\n  for (let i = 0; i < inputH; i++) {\n    for (let j = 0; j < inputW; j++) {\n      padded[i + padding][j + padding] = input[i][j];\n    }\n  }\n}",
            explanation: "Padding 在圖像周圍補零。如果 padding=1，一張 6×6 的圖就變成 8×8：\n\n• 上下左右各多一圈 0\n• 原始像素被放在中間\n\n目的是讓卷積後輸出大小和輸入一樣（搭配適當的 kernel size）。沒有 padding 的話，每次卷積都會讓圖變小。"
          },
          {
            title: "步驟三：Max Pooling",
            code: "for (let i = 0; i < outH; i++) {\n  for (let j = 0; j < outW; j++) {\n    let maxVal = -Infinity;\n    for (let pi = 0; pi < poolSize; pi++) {\n      for (let pj = 0; pj < poolSize; pj++) {\n        maxVal = Math.max(maxVal, input[i * stride + pi][j * stride + pj]);\n      }\n    }\n    output[i][j] = maxVal;\n  }\n}",
            explanation: "Max Pooling 非常簡單：\n\n1. 把輸入分成不重疊的小區塊（通常 2×2）\n2. 在每個區塊中找最大值\n3. 最大值作為輸出\n\n2×2 的 Max Pooling 會讓特徵圖的寬高各減半。例如 4×4 → 2×2。\n\n它同時做了兩件事：縮小尺寸（減少計算量）和提供平移不變性（特徵稍微移動不影響結果）。"
          },
          {
            title: "步驟四：CNN Pipeline",
            code: "const convResult = conv2d(image, edgeKernel);\nconst reluResult = relu2d(convResult);\nconst poolResult = maxPool2d(reluResult);",
            explanation: "一個典型的 CNN 層由三步組成：\n\n1. **卷積**：用邊緣偵測核掃描圖像，找出垂直邊緣\n2. **ReLU**：把負值變成 0，只保留「有邊緣」的部分\n3. **Max Pooling**：縮小特徵圖，保留最強的特徵\n\n觀察輸出：在原始圖像中，左半邊是 0，右半邊是 1，中間有一條垂直邊緣。卷積核成功偵測到了這條邊緣（中間列有大的正值），而兩側是 0 或負值（經過 ReLU 變成 0）。"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 從零實作 CNN 的核心操作
function conv2d(input, kernel, stride = 1, padding = 0) {
  const inputH = input.length, inputW = input[0].length;
  const kernelH = kernel.length, kernelW = kernel[0].length;
  let padded = input;
  if (padding > 0) {
    const pH = inputH + 2 * padding, pW = inputW + 2 * padding;
    padded = Array.from({ length: pH }, () => new Array(pW).fill(0));
    for (let i = 0; i < inputH; i++)
      for (let j = 0; j < inputW; j++)
        padded[i + padding][j + padding] = input[i][j];
  }
  const outH = Math.floor((padded.length - kernelH) / stride) + 1;
  const outW = Math.floor((padded[0].length - kernelW) / stride) + 1;
  const output = Array.from({ length: outH }, () => new Array(outW).fill(0));
  for (let i = 0; i < outH; i++)
    for (let j = 0; j < outW; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelH; ki++)
        for (let kj = 0; kj < kernelW; kj++)
          sum += padded[i * stride + ki][j * stride + kj] * kernel[ki][kj];
      output[i][j] = sum;
    }
  return output;
}

function maxPool2d(input, poolSize = 2, stride = 2) {
  const outH = Math.floor((input.length - poolSize) / stride) + 1;
  const outW = Math.floor((input[0].length - poolSize) / stride) + 1;
  const output = Array.from({ length: outH }, () => new Array(outW).fill(0));
  for (let i = 0; i < outH; i++)
    for (let j = 0; j < outW; j++) {
      let maxVal = -Infinity;
      for (let pi = 0; pi < poolSize; pi++)
        for (let pj = 0; pj < poolSize; pj++)
          maxVal = Math.max(maxVal, input[i * stride + pi][j * stride + pj]);
      output[i][j] = maxVal;
    }
  return output;
}

const image = [
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
];

const edgeKernel = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];

console.log("=== 原始圖像 ===");
image.forEach(row => console.log(row.join(" ")));

const convResult = conv2d(image, edgeKernel);
console.log("\\n=== 卷積後（邊緣偵測）===");
convResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));

const reluResult = convResult.map(row => row.map(v => Math.max(0, v)));
console.log("\\n=== ReLU 後 ===");
reluResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));

const poolResult = maxPool2d(reluResult);
console.log("\\n=== Max Pooling (2×2) 後 ===");
poolResult.forEach(row => console.log(row.map(v => v.toString().padStart(3)).join(" ")));`,
        explanation: "這段程式碼展示了 CNN 的核心操作流程：2D 卷積（用邊緣偵測核）→ ReLU 激活 → Max Pooling。觀察輸出中，卷積核成功偵測到了圖像中的垂直邊緣。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "CNN 使用「參數共享」的主要好處是什麼？",
          options: [
            "讓圖像變得更清晰",
            "大幅減少參數數量，同時讓同一特徵在圖像不同位置都能被偵測",
            "增加網路的層數",
            "讓訓練變慢但更準確",
          ],
          correct: 1,
          explanation: "參數共享意味著同一個卷積核在整張圖上滑動使用。這有兩個好處：(1) 大幅減少參數數量（一個 3×3 的核只有 9 個參數，不管圖像多大）；(2) 不管特徵（如邊緣）出現在圖像的哪個位置，都能被同一個核偵測到。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Max Pooling 的作用是什麼？",
          options: [
            "增加圖像解析度",
            "縮小特徵圖大小，保留最重要的特徵，並提供平移不變性",
            "增加更多的顏色通道",
            "把圖像旋轉 90 度",
          ],
          correct: 1,
          explanation: "Max Pooling 在每個小區域取最大值，效果是：(1) 縮小特徵圖（2×2 pooling 讓大小減半）；(2) 保留最強的特徵（最大值代表「有這個特徵」）；(3) 提供平移不變性（特徵稍微移動幾個像素不影響結果）。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "一個 6×6 的輸入，使用 3×3 的卷積核，padding=0，stride=1，輸出大小是多少？",
          options: [
            "6×6",
            "4×4",
            "3×3",
            "5×5",
          ],
          correct: 1,
          explanation: "使用公式：output_size = (input_size - kernel_size + 2 × padding) / stride + 1 = (6 - 3 + 0) / 1 + 1 = 4。所以輸出是 4×4。沒有 padding 的話，每次卷積都會讓圖像縮小 (kernel_size - 1) 個像素。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 Max Pooling",
          description: "請實作一個 myMaxPool 函數，接收一個 2D 陣列 input 和池化大小 poolSize（預設 2），回傳 max pooling 的結果。\n\n假設 stride = poolSize（不重疊），且輸入大小能被 poolSize 整除。",
          starterCode: `// 請實作 myMaxPool 函數
function myMaxPool(input, poolSize) {
  poolSize = poolSize || 2;
  // TODO: 計算輸出大小
  // TODO: 在每個 poolSize x poolSize 區域中找最大值
  // TODO: 回傳結果
}

// 測試
const test1 = [[1,3,2,4],[5,2,6,1],[3,7,8,2],[4,1,3,9]];
console.log(JSON.stringify(myMaxPool(test1, 2)));
const test2 = [[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17,18]];
console.log(JSON.stringify(myMaxPool(test2, 3)));`,
          solution: `function myMaxPool(input, poolSize) {
  poolSize = poolSize || 2;
  const outH = Math.floor(input.length / poolSize);
  const outW = Math.floor(input[0].length / poolSize);
  const output = [];
  for (let i = 0; i < outH; i++) {
    const row = [];
    for (let j = 0; j < outW; j++) {
      let maxVal = -Infinity;
      for (let pi = 0; pi < poolSize; pi++) {
        for (let pj = 0; pj < poolSize; pj++) {
          maxVal = Math.max(maxVal, input[i * poolSize + pi][j * poolSize + pj]);
        }
      }
      row.push(maxVal);
    }
    output.push(row);
  }
  return output;
}

const test1 = [[1,3,2,4],[5,2,6,1],[3,7,8,2],[4,1,3,9]];
console.log(JSON.stringify(myMaxPool(test1, 2)));
const test2 = [[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17,18]];
console.log(JSON.stringify(myMaxPool(test2, 3)));`,
          testCases: [
            { input: "console.log(JSON.stringify(myMaxPool([[1,3,2,4],[5,2,6,1],[3,7,8,2],[4,1,3,9]], 2)))", expected: "[[5,6],[7,9]]" },
            { input: "console.log(JSON.stringify(myMaxPool([[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17,18]], 3)))", expected: "[[15,18]]" },
          ],
          hints: [
            "輸出大小 = input 大小 / poolSize（取整數）",
            "用兩層迴圈遍歷每個池化區域",
            "在每個區域內再用兩層迴圈找最大值",
          ],
        },
      },
    ],
    prevChapter: 9,
    nextChapter: 11,
  },
  // ============================================================
  // Chapter 11
  // ============================================================
  {
    id: 11,
    title: "循環神經網路 (RNN)",
    subtitle: "處理序列資料的記憶型網路",
    icon: "🔁",
    sections: [
      {
        type: "text",
        content: `## 為什麼需要 RNN？

到目前為止，我們學的網路（全連接、CNN）都有一個共同的限制：**它們不能處理「有順序」的資料**。

### 順序很重要的例子

想像以下場景：
- **文字**：「我喜歡你」和「你喜歡我」用了一樣的字，但意思完全不同
- **音樂**：Do-Re-Mi 和 Mi-Re-Do 聽起來完全不一樣
- **股票**：今天的股價和前幾天的走勢有關
- **天氣**：明天的天氣和過去幾天的天氣模式有關

這些都是 **序列資料（Sequential Data）**——資料的順序本身就包含重要信息。

### 傳統網路的問題

全連接網路把所有輸入同時丟進去，沒有「時間」的概念。就像你要理解一個句子，但只給你所有字的集合（無序），你很難理解它的意思。

### RNN 的解決方案

RNN 加入了 **「記憶」** 的概念。它一次處理序列中的一個元素，同時把之前處理的信息「記住」，傳遞到下一步。

**生活比喻**：就像你在看一部電影。你不是看完每一幕就忘記前面的劇情，而是把之前的情節「記在腦中」，用來理解當前發生的事情。`,
      },
      {
        type: "diagram",
        content: "rnn-unrolled",
        diagram: "rnn-unrolled",
        caption: "RNN 時間展開圖：每個時間步接收輸入 x，更新隱藏狀態 h，產生輸出 y。黃色箭頭代表記憶傳遞。",
      },
      {
        type: "text",
        content: `## RNN 的運作原理

### 核心公式

在每個時間步 t：

\`h_t = tanh(W_hh × h_{t-1} + W_xh × x_t + b_h)\`
\`y_t = W_hy × h_t + b_y\`

- **x_t**：時間步 t 的輸入
- **h_t**：時間步 t 的隱藏狀態（「記憶」）
- **h_{t-1}**：上一步的隱藏狀態
- **W_hh**：隱藏狀態到隱藏狀態的權重（「如何利用記憶」）
- **W_xh**：輸入到隱藏狀態的權重（「如何處理新輸入」）
- **W_hy**：隱藏狀態到輸出的權重
- **tanh**：激活函數，把值壓縮到 -1 到 1 之間

### 展開來看

\`\`\`
x₁ → [RNN Cell] → h₁ → y₁
         ↓
x₂ → [RNN Cell] → h₂ → y₂
         ↓
x₃ → [RNN Cell] → h₃ → y₃
\`\`\`

每一步的 RNN Cell 其實是 **同一組權重**（參數共享）！只是隱藏狀態 h 在不斷更新。

### 直覺理解

\`h_t = tanh(記憶部分 + 新輸入部分)\`

- **W_hh × h_{t-1}**：「從上一步的記憶中提取相關信息」
- **W_xh × x_t**：「處理當前的新輸入」
- 兩者結合後通過 tanh，形成新的記憶 h_t`,
      },
      {
        type: "text",
        content: `## RNN 的問題：梯度消失

RNN 在處理長序列時有一個嚴重的問題：**梯度消失**。

### 為什麼？

反向傳播時，梯度需要通過多個時間步回傳。每經過一步，梯度會被乘以 W_hh 和 tanh 的導數。如果這些值小於 1，經過多步後梯度就會指數級地縮小，趨近於 0。

**比喻**：就像傳話遊戲——第一個人說的話，經過 20 個人傳遞後，幾乎面目全非。

這意味著 RNN 很難學習「長期依賴」——序列開頭的信息很難影響後面的預測。

## LSTM：長短期記憶網路

LSTM（Long Short-Term Memory）是為了解決梯度消失問題而設計的。它用三個「門」來控制信息的流動：

### 1. 遺忘門（Forget Gate）
\`f_t = σ(W_f × [h_{t-1}, x_t] + b_f)\`
決定「上一步的記憶中，哪些該丟掉」。輸出 0~1，0 表示完全遺忘，1 表示完全保留。

### 2. 輸入門（Input Gate）
\`i_t = σ(W_i × [h_{t-1}, x_t] + b_i)\`
\`C̃_t = tanh(W_C × [h_{t-1}, x_t] + b_C)\`
決定「新輸入中，哪些該記住」。

### 3. 輸出門（Output Gate）
\`o_t = σ(W_o × [h_{t-1}, x_t] + b_o)\`
決定「記憶中，哪些該輸出」。

### 記憶更新
\`C_t = f_t × C_{t-1} + i_t × C̃_t\`（選擇性遺忘 + 選擇性記憶）
\`h_t = o_t × tanh(C_t)\`（選擇性輸出）

### 生活比喻

LSTM 就像你在看書做筆記：
- **遺忘門**：劃掉筆記中不重要的部分
- **輸入門**：決定新讀到的哪些重點要加入筆記
- **輸出門**：考試時決定筆記中的哪些知識要用來回答問題

### RNN 的實際應用

- **文字生成**：給定前面的字，預測下一個字
- **機器翻譯**：把一個語言的句子轉成另一個語言
- **語音辨識**：把聲音波形轉成文字
- **時間序列預測**：預測股價、天氣、銷售量
- **情感分析**：判斷一段文字是正面還是負面`,
      },
      {
        type: "code-step",
        content: `// 從零實作一個簡單的 RNN 字元預測器
class SimpleRNN {
  constructor(inputSize, hiddenSize, outputSize) {
    this.hiddenSize = hiddenSize;
    // 初始化權重
    const scale = 0.1;
    this.Wxh = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() - 0.5) * scale));
    this.Whh = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * scale));
    this.Why = Array.from({ length: outputSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * scale));
    this.bh = new Array(hiddenSize).fill(0);
    this.by = new Array(outputSize).fill(0);
  }

  // 前向傳播一個時間步
  step(x, hPrev) {
    // h_t = tanh(Wxh * x + Whh * h_{t-1} + bh)
    const h = new Array(this.hiddenSize).fill(0);
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.bh[i];
      for (let j = 0; j < x.length; j++) sum += this.Wxh[i][j] * x[j];
      for (let j = 0; j < this.hiddenSize; j++) sum += this.Whh[i][j] * hPrev[j];
      h[i] = Math.tanh(sum);
    }

    // y = Why * h + by
    const y = new Array(this.Why.length).fill(0);
    for (let i = 0; i < this.Why.length; i++) {
      let sum = this.by[i];
      for (let j = 0; j < this.hiddenSize; j++) sum += this.Why[i][j] * h[j];
      y[i] = sum;
    }

    return { h, y };
  }

  // Softmax
  softmax(logits) {
    const maxVal = Math.max(...logits);
    const exps = logits.map(v => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
  }

  // 處理整個序列
  forward(inputs, hInit) {
    let h = hInit || new Array(this.hiddenSize).fill(0);
    const outputs = [];
    const hiddens = [h];

    for (const x of inputs) {
      const result = this.step(x, h);
      h = result.h;
      outputs.push(this.softmax(result.y));
      hiddens.push(h);
    }

    return { outputs, hiddens };
  }
}

// 字元級別的序列預測
const text = "hello world";
const chars = [...new Set(text)];
const charToIdx = {};
chars.forEach((c, i) => charToIdx[c] = i);
const vocabSize = chars.length;

// One-hot 編碼
function oneHot(idx) {
  const vec = new Array(vocabSize).fill(0);
  vec[idx] = 1;
  return vec;
}

const rnn = new SimpleRNN(vocabSize, 16, vocabSize);

// 準備訓練資料：輸入一個字，預測下一個字
const inputs = [];
const targets = [];
for (let i = 0; i < text.length - 1; i++) {
  inputs.push(oneHot(charToIdx[text[i]]));
  targets.push(charToIdx[text[i + 1]]);
}

console.log("=== 字元表 ===");
console.log(chars.join(", "));
console.log("\\n=== 訓練序列 ===");
for (let i = 0; i < text.length - 1; i++) {
  console.log(\`'\${text[i]}' → '\${text[i + 1]}'\`);
}

// 前向傳播（未訓練）
const { outputs } = rnn.forward(inputs);
console.log("\\n=== 未訓練的預測 ===");
for (let i = 0; i < outputs.length; i++) {
  const predIdx = outputs[i].indexOf(Math.max(...outputs[i]));
  console.log(\`輸入: '\${text[i]}' → 預測: '\${chars[predIdx]}' (期望: '\${text[i+1]}')\`);
}
console.log("\\n（模型還沒訓練，所以預測是隨機的。訓練後就能學會序列模式！）");`,
        steps: [
          {
            title: "步驟一：初始化 RNN",
            code: "constructor(inputSize, hiddenSize, outputSize) {\n  this.Wxh = ...;  // 輸入→隱藏 權重\n  this.Whh = ...;  // 隱藏→隱藏 權重\n  this.Why = ...;  // 隱藏→輸出 權重\n  this.bh = ...;   // 隱藏層偏差\n  this.by = ...;   // 輸出層偏差\n}",
            explanation: "RNN 有三組權重矩陣：\n\n• Wxh（inputSize × hiddenSize）：把輸入轉換成隱藏空間\n• Whh（hiddenSize × hiddenSize）：處理上一步的隱藏狀態（「記憶」）\n• Why（hiddenSize × outputSize）：把隱藏狀態轉換成輸出\n\n注意 Whh 是方陣——它把隱藏狀態映射到同樣大小的隱藏狀態，這就是「循環」的來源。"
          },
          {
            title: "步驟二：RNN 的單步計算",
            code: "step(x, hPrev) {\n  // h_t = tanh(Wxh * x + Whh * h_{t-1} + bh)\n  const h = new Array(this.hiddenSize).fill(0);\n  for (let i = 0; i < this.hiddenSize; i++) {\n    let sum = this.bh[i];\n    for (let j = 0; j < x.length; j++) sum += this.Wxh[i][j] * x[j];\n    for (let j = 0; j < this.hiddenSize; j++) sum += this.Whh[i][j] * hPrev[j];\n    h[i] = Math.tanh(sum);\n  }\n  ...\n}",
            explanation: "這是 RNN 最核心的計算：\n\n1. 對每個隱藏神經元 i：\n   • 從偏差 bh[i] 開始\n   • 加上所有輸入 × 對應的 Wxh 權重\n   • 加上所有上一步隱藏狀態 × 對應的 Whh 權重\n   • 通過 tanh 激活函數\n\n結果 h 就是新的隱藏狀態——它融合了「新輸入」和「歷史記憶」。"
          },
          {
            title: "步驟三：處理整個序列",
            code: "forward(inputs, hInit) {\n  let h = hInit || new Array(this.hiddenSize).fill(0);\n  for (const x of inputs) {\n    const result = this.step(x, h);\n    h = result.h;\n    outputs.push(this.softmax(result.y));\n  }\n}",
            explanation: "處理序列時，我們逐一輸入每個元素：\n\n1. 初始隱藏狀態 h 全為 0（沒有先前的記憶）\n2. 對序列中的每個輸入 x：\n   • 呼叫 step(x, h) 得到新的隱藏狀態和輸出\n   • 更新 h 為新的隱藏狀態\n   • 用 softmax 把輸出轉成機率分佈\n\n注意 h 是如何一步步傳遞的——這就是 RNN 的「記憶」機制。"
          },
          {
            title: "步驟四：字元預測任務",
            code: "// 輸入一個字，預測下一個字\nfor (let i = 0; i < text.length - 1; i++) {\n  inputs.push(oneHot(charToIdx[text[i]]));\n  targets.push(charToIdx[text[i + 1]]);\n}",
            explanation: "字元級別的語言模型：\n\n• 輸入：當前字元的 one-hot 編碼\n• 目標：下一個字元的索引\n• 例如 'hello' → 'h'→'e', 'e'→'l', 'l'→'l', 'l'→'o'\n\n訓練後，RNN 能學會序列中的模式，例如 'h' 後面通常跟著 'e'，'l' 後面可能跟著 'l' 或 'o'。這就是所有文字生成 AI 的基礎原理！"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 簡單的 RNN 字元預測器
class SimpleRNN {
  constructor(inputSize, hiddenSize, outputSize) {
    this.hiddenSize = hiddenSize;
    const s = 0.1;
    this.Wxh = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() - 0.5) * s));
    this.Whh = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * s));
    this.Why = Array.from({ length: outputSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * s));
    this.bh = new Array(hiddenSize).fill(0);
    this.by = new Array(outputSize).fill(0);
  }
  step(x, hPrev) {
    const h = this.bh.map((b, i) => {
      let sum = b;
      for (let j = 0; j < x.length; j++) sum += this.Wxh[i][j] * x[j];
      for (let j = 0; j < this.hiddenSize; j++) sum += this.Whh[i][j] * hPrev[j];
      return Math.tanh(sum);
    });
    const y = this.by.map((b, i) => {
      let sum = b;
      for (let j = 0; j < this.hiddenSize; j++) sum += this.Why[i][j] * h[j];
      return sum;
    });
    return { h, y };
  }
  softmax(logits) {
    const max = Math.max(...logits);
    const exps = logits.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b);
    return exps.map(v => v / sum);
  }
  forward(inputs) {
    let h = new Array(this.hiddenSize).fill(0);
    const outputs = [];
    for (const x of inputs) {
      const res = this.step(x, h);
      h = res.h;
      outputs.push(this.softmax(res.y));
    }
    return outputs;
  }
}

const text = "hello world";
const chars = [...new Set(text)];
const charToIdx = {};
chars.forEach((c, i) => charToIdx[c] = i);

function oneHot(idx) {
  const v = new Array(chars.length).fill(0);
  v[idx] = 1;
  return v;
}

const rnn = new SimpleRNN(chars.length, 16, chars.length);
const inputs = [];
for (let i = 0; i < text.length - 1; i++) inputs.push(oneHot(charToIdx[text[i]]));

const outputs = rnn.forward(inputs);
console.log("=== RNN 字元預測（未訓練）===");
for (let i = 0; i < outputs.length; i++) {
  const predIdx = outputs[i].indexOf(Math.max(...outputs[i]));
  console.log(\`'\${text[i]}' → 預測: '\${chars[predIdx]}' (期望: '\${text[i+1]}')\`);
}
console.log("\\n訓練後 RNN 就能學會字元之間的規律！");`,
        explanation: "這段程式碼實作了一個簡單的 RNN 字元預測器。它逐個處理字元，用隱藏狀態傳遞序列信息。未訓練時預測是隨機的，但經過訓練後就能學會字元之間的規律。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "RNN 中的「隱藏狀態 h」的作用是什麼？",
          options: [
            "讓程式碼更難閱讀",
            "作為「記憶」，將前面時間步的信息傳遞到後面",
            "加密輸入資料",
            "減少計算量",
          ],
          correct: 1,
          explanation: "隱藏狀態 h 是 RNN 的核心——它像一個「記憶體」，在每個時間步都會被更新。它融合了當前輸入和之前所有時間步的信息，讓 RNN 能夠理解序列的上下文。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "LSTM 為什麼能解決基本 RNN 的梯度消失問題？",
          options: [
            "因為 LSTM 不需要反向傳播",
            "因為 LSTM 用門控機制讓梯度可以直接通過記憶單元流動，不會被反覆相乘而消失",
            "因為 LSTM 使用更大的學習率",
            "因為 LSTM 不處理長序列",
          ],
          correct: 1,
          explanation: "LSTM 的記憶單元 C 通過遺忘門和輸入門直接更新（加法操作而非乘法），這讓梯度可以「直通」多個時間步而不衰減。遺忘門可以保持接近 1，讓重要信息和梯度能夠流過很長的序列。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "RNN 和全連接網路最大的區別是什麼？",
          options: [
            "RNN 不使用權重",
            "RNN 有「時間」的概念，能記住序列中前面的信息",
            "RNN 只能處理圖像",
            "RNN 不需要訓練",
          ],
          correct: 1,
          explanation: "RNN 最大的特點是加入了「循環」結構——隱藏狀態從一個時間步傳遞到下一個時間步。這讓 RNN 能夠處理序列資料，記住上下文信息，而全連接網路只能處理固定大小的獨立輸入。",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作基本 RNN Cell",
          description: "請實作一個 rnnCell 函數，接收輸入 x（陣列）、上一步的隱藏狀態 hPrev（陣列）、權重 Wxh（2D 陣列）、Whh（2D 陣列）和偏差 bh（陣列），回傳新的隱藏狀態 h。\n\n公式：h[i] = tanh(Σ(Wxh[i][j] * x[j]) + Σ(Whh[i][j] * hPrev[j]) + bh[i])",
          starterCode: `// 請實作 rnnCell 函數
function rnnCell(x, hPrev, Wxh, Whh, bh) {
  // TODO: 計算新的隱藏狀態 h
  // h[i] = tanh(Wxh[i] · x + Whh[i] · hPrev + bh[i])
}

// 測試
const x = [1, 0];
const hPrev = [0.5, -0.3];
const Wxh = [[0.1, 0.2], [0.3, 0.4]];
const Whh = [[0.5, 0.1], [0.2, 0.3]];
const bh = [0, 0];
const h = rnnCell(x, hPrev, Wxh, Whh, bh);
console.log(h.map(v => v.toFixed(4)).join(", "));`,
          solution: `function rnnCell(x, hPrev, Wxh, Whh, bh) {
  const hiddenSize = bh.length;
  const h = [];
  for (let i = 0; i < hiddenSize; i++) {
    let sum = bh[i];
    for (let j = 0; j < x.length; j++) {
      sum += Wxh[i][j] * x[j];
    }
    for (let j = 0; j < hPrev.length; j++) {
      sum += Whh[i][j] * hPrev[j];
    }
    h.push(Math.tanh(sum));
  }
  return h;
}

const x = [1, 0];
const hPrev = [0.5, -0.3];
const Wxh = [[0.1, 0.2], [0.3, 0.4]];
const Whh = [[0.5, 0.1], [0.2, 0.3]];
const bh = [0, 0];
const h = rnnCell(x, hPrev, Wxh, Whh, bh);
console.log(h.map(v => v.toFixed(4)).join(", "));`,
          testCases: [
            { input: "const h = rnnCell([1,0],[0.5,-0.3],[[0.1,0.2],[0.3,0.4]],[[0.5,0.1],[0.2,0.3]],[0,0]); console.log(h.map(v=>v.toFixed(4)).join(', '))", expected: "0.3362, 0.5370" },
          ],
          hints: [
            "建立一個長度等於 hiddenSize 的輸出陣列",
            "對每個隱藏神經元 i，計算 Wxh[i] · x + Whh[i] · hPrev + bh[i]",
            "最後對每個值套用 Math.tanh()",
          ],
        },
      },
    ],
    prevChapter: 10,
    nextChapter: 12,
  },
  // ============================================================
  // Chapter 12
  // ============================================================
  {
    id: 12,
    title: "實戰專案：手寫數字辨識",
    subtitle: "綜合運用所有知識完成一個真實專案",
    icon: "✍️",
    sections: [
      {
        type: "text",
        content: `## 專案目標

恭喜你來到最後一章！在這個實戰專案中，我們將綜合運用前 11 章學到的所有知識，建立一個 **手寫數字辨識系統**。

### MNIST 資料集

MNIST 是機器學習界最經典的資料集，被稱為「Hello World of ML」：

- **60,000 張** 訓練圖片 + **10,000 張** 測試圖片
- 每張圖片是 **28 × 28 像素** 的灰度圖
- 每個像素值介於 0（黑）到 255（白）之間
- 標籤是 0~9 的數字

### 我們的計劃

由於瀏覽器環境限制，我們會生成 **模擬的簡化版 MNIST 資料**，但所有的神經網路技術都是真實的：

1. **資料前處理**：正規化、One-hot 編碼
2. **網路架構設計**：784 → 128 → 64 → 10
3. **Softmax 輸出層**：多分類問題
4. **交叉熵損失函數**：多分類的損失計算
5. **Mini-batch 訓練**：使用小批次訓練
6. **效能評估**：計算準確率

### 用到的知識回顧

| 章節 | 知識點 | 在本專案中的應用 |
|------|--------|----------------|
| Ch1-2 | 神經元、感知器 | 網路的基本構建塊 |
| Ch3 | 激活函數 | 隱藏層使用 ReLU |
| Ch4 | 前向傳播 | 資料流經網路 |
| Ch5 | 損失函數 | 交叉熵損失 |
| Ch6 | 反向傳播 | 計算梯度 |
| Ch7 | 完整網路 | 整體架構 |
| Ch8 | 正則化 | 防止過擬合 |
| Ch9 | 優化器 | 使用 Adam 或 SGD |`,
      },
      {
        type: "text",
        content: `## 關鍵概念：Softmax 與多分類

### 從二分類到多分類

前面的章節中，我們用 Sigmoid 做二分類（是/否）。但手寫數字有 **10 個類別**（0~9），我們需要 **Softmax**。

### Softmax 函數

Softmax 把一組數字轉換成 **機率分佈**（所有值加起來 = 1）：

\`softmax(z_i) = e^(z_i) / Σ(e^(z_j))\`

例如：
- 輸入：[2.0, 1.0, 0.1]
- e 的次方：[7.39, 2.72, 1.11]
- 總和：11.22
- Softmax：[0.659, 0.242, 0.099]

最大的值（2.0）得到最高的機率（65.9%），這就是模型的預測！

### 交叉熵損失（Cross-Entropy Loss）

多分類的損失函數：

\`L = -Σ(y_i × log(ŷ_i))\`

其中 y 是 one-hot 編碼的正確答案，ŷ 是 softmax 輸出的預測機率。

因為 y 是 one-hot（只有一個位置是 1），公式簡化為：

\`L = -log(ŷ_correct)\`

也就是說，損失 = 正確類別的預測機率的負對數。
- 預測機率 0.9 → 損失 0.105（低，很好！）
- 預測機率 0.1 → 損失 2.303（高，要改進！）

### One-hot 編碼

將類別標籤轉成向量：
- 數字 3 → [0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
- 數字 7 → [0, 0, 0, 0, 0, 0, 0, 1, 0, 0]

這樣每個輸出神經元負責一個數字類別。`,
      },
      {
        type: "text",
        content: `## 網路架構設計

### 輸入層：784 個神經元
每張 28×28 的圖片被「攤平」成 784 個數值的一維向量。每個值介於 0 到 1 之間（原始 0~255 除以 255）。

### 第一隱藏層：128 個神經元 + ReLU
- 參數：784 × 128 + 128 = 100,480 個
- 學習基本特徵（邊緣、轉角）

### 第二隱藏層：64 個神經元 + ReLU
- 參數：128 × 64 + 64 = 8,256 個
- 組合基本特徵成更複雜的模式

### 輸出層：10 個神經元 + Softmax
- 參數：64 × 10 + 10 = 650 個
- 每個神經元代表一個數字（0~9）
- Softmax 確保輸出加總為 1

### 總參數量
100,480 + 8,256 + 650 = **109,386 個參數**

### 資料前處理
1. **正規化**：像素值從 0~255 縮放到 0~1（除以 255）
2. **攤平**：28×28 的 2D 圖片轉成 784 的 1D 向量
3. **One-hot 編碼**：標籤轉成 10 維向量
4. **打亂順序**：避免訓練時的順序偏差
5. **分割資料**：訓練集 / 驗證集 / 測試集`,
      },
      {
        type: "code-step",
        content: `// 完整的手寫數字辨識專案
// =====================================

// 工具函數
function sigmoid(x) { return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); }
function relu(x) { return Math.max(0, x); }
function reluDeriv(x) { return x > 0 ? 1 : 0; }

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

function crossEntropyLoss(predicted, target) {
  let loss = 0;
  for (let i = 0; i < target.length; i++) {
    loss -= target[i] * Math.log(predicted[i] + 1e-8);
  }
  return loss;
}

function oneHot(label, numClasses = 10) {
  const vec = new Array(numClasses).fill(0);
  vec[label] = 1;
  return vec;
}

// 生成模擬 MNIST 資料
function generateDigitData(numSamples = 500) {
  const data = [];
  for (let i = 0; i < numSamples; i++) {
    const label = Math.floor(Math.random() * 10);
    // 模擬 28x28 = 784 維的特徵（簡化版）
    const features = new Array(784).fill(0);
    // 根據數字標籤設定特徵模式
    for (let j = 0; j < 784; j++) {
      // 每個數字有不同的特徵分佈
      const region = Math.floor(j / 78.4); // 10 個區域
      if (region === label) {
        features[j] = 0.8 + Math.random() * 0.2; // 主要區域：高值
      } else if (Math.abs(region - label) <= 1) {
        features[j] = 0.3 + Math.random() * 0.3; // 相鄰區域：中值
      } else {
        features[j] = Math.random() * 0.2; // 其他區域：低值
      }
    }
    data.push({ features, label, oneHot: oneHot(label) });
  }
  return data;
}

// 神經網路（784 → 128 → 64 → 10）
class DigitClassifier {
  constructor() {
    // Xavier 初始化
    const s1 = Math.sqrt(2 / (784 + 128));
    const s2 = Math.sqrt(2 / (128 + 64));
    const s3 = Math.sqrt(2 / (64 + 10));

    this.w1 = Array.from({ length: 128 }, () =>
      Array.from({ length: 784 }, () => (Math.random() * 2 - 1) * s1));
    this.b1 = new Array(128).fill(0);

    this.w2 = Array.from({ length: 64 }, () =>
      Array.from({ length: 128 }, () => (Math.random() * 2 - 1) * s2));
    this.b2 = new Array(64).fill(0);

    this.w3 = Array.from({ length: 10 }, () =>
      Array.from({ length: 64 }, () => (Math.random() * 2 - 1) * s3));
    this.b3 = new Array(10).fill(0);
  }

  forward(input) {
    // 第一層：ReLU
    this.z1 = this.b1.map((b, j) => {
      let sum = b;
      for (let i = 0; i < input.length; i++) sum += input[i] * this.w1[j][i];
      return sum;
    });
    this.a1 = this.z1.map(relu);

    // 第二層：ReLU
    this.z2 = this.b2.map((b, j) => {
      let sum = b;
      for (let i = 0; i < this.a1.length; i++) sum += this.a1[i] * this.w2[j][i];
      return sum;
    });
    this.a2 = this.z2.map(relu);

    // 輸出層：Softmax
    const logits = this.b3.map((b, j) => {
      let sum = b;
      for (let i = 0; i < this.a2.length; i++) sum += this.a2[i] * this.w3[j][i];
      return sum;
    });
    this.output = softmax(logits);
    return this.output;
  }

  backward(input, target, lr = 0.01) {
    // 輸出層梯度（softmax + cross-entropy 的梯度簡化為 pred - target）
    const dOut = this.output.map((p, i) => p - target[i]);

    // w3 梯度
    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < 64; i++) {
        this.w3[j][i] -= lr * dOut[j] * this.a2[i];
      }
      this.b3[j] -= lr * dOut[j];
    }

    // 第二隱藏層梯度
    const dA2 = new Array(64).fill(0);
    for (let i = 0; i < 64; i++) {
      for (let j = 0; j < 10; j++) dA2[i] += dOut[j] * this.w3[j][i];
      dA2[i] *= reluDeriv(this.z2[i]);
    }

    // w2 梯度
    for (let j = 0; j < 64; j++) {
      for (let i = 0; i < 128; i++) {
        this.w2[j][i] -= lr * dA2[j] * this.a1[i];
      }
      this.b2[j] -= lr * dA2[j];
    }

    // 第一隱藏層梯度
    const dA1 = new Array(128).fill(0);
    for (let i = 0; i < 128; i++) {
      for (let j = 0; j < 64; j++) dA1[i] += dA2[j] * this.w2[j][i];
      dA1[i] *= reluDeriv(this.z1[i]);
    }

    // w1 梯度
    for (let j = 0; j < 128; j++) {
      for (let i = 0; i < 784; i++) {
        this.w1[j][i] -= lr * dA1[j] * input[i];
      }
      this.b1[j] -= lr * dA1[j];
    }
  }
}

// 訓練流程
const allData = generateDigitData(500);
// 打亂
for (let i = allData.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [allData[i], allData[j]] = [allData[j], allData[i]];
}

const trainData = allData.slice(0, 350);
const valData = allData.slice(350, 425);
const testData = allData.slice(425);

const model = new DigitClassifier();
const batchSize = 32;
const epochs = 15;
const lr = 0.005;

console.log("=== 手寫數字辨識訓練 ===");
console.log(\`架構: 784 → 128 → 64 → 10\`);
console.log(\`訓練集: \${trainData.length} 筆, 驗證集: \${valData.length} 筆, 測試集: \${testData.length} 筆\`);
console.log(\`批次大小: \${batchSize}, 學習率: \${lr}\\n\`);

for (let epoch = 0; epoch < epochs; epoch++) {
  let trainLoss = 0;
  let trainCorrect = 0;

  // Mini-batch 訓練
  for (let b = 0; b < trainData.length; b += batchSize) {
    const batch = trainData.slice(b, b + batchSize);
    for (const d of batch) {
      const pred = model.forward(d.features);
      trainLoss += crossEntropyLoss(pred, d.oneHot);
      if (pred.indexOf(Math.max(...pred)) === d.label) trainCorrect++;
      model.backward(d.features, d.oneHot, lr);
    }
  }

  // 驗證
  let valCorrect = 0;
  for (const d of valData) {
    const pred = model.forward(d.features);
    if (pred.indexOf(Math.max(...pred)) === d.label) valCorrect++;
  }

  if (epoch % 3 === 0 || epoch === epochs - 1) {
    console.log(\`Epoch \${(epoch+1).toString().padStart(2)}: 損失=\${(trainLoss/trainData.length).toFixed(4)}, 訓練準確率=\${(trainCorrect/trainData.length*100).toFixed(1)}%, 驗證準確率=\${(valCorrect/valData.length*100).toFixed(1)}%\`);
  }
}

// 測試集最終評估
let testCorrect = 0;
const confusion = Array.from({ length: 10 }, () => new Array(10).fill(0));
for (const d of testData) {
  const pred = model.forward(d.features);
  const predLabel = pred.indexOf(Math.max(...pred));
  if (predLabel === d.label) testCorrect++;
  confusion[d.label][predLabel]++;
}

console.log(\`\\n=== 最終測試結果 ===\`);
console.log(\`測試集準確率: \${testCorrect}/\${testData.length} = \${(testCorrect/testData.length*100).toFixed(1)}%\`);`,
        steps: [
          {
            title: "步驟一：Softmax 和交叉熵",
            code: "function softmax(logits) {\n  const max = Math.max(...logits);\n  const exps = logits.map(v => Math.exp(v - max));\n  const sum = exps.reduce((a, b) => a + b, 0);\n  return exps.map(v => v / sum);\n}\n\nfunction crossEntropyLoss(predicted, target) {\n  let loss = 0;\n  for (let i = 0; i < target.length; i++) {\n    loss -= target[i] * Math.log(predicted[i] + 1e-8);\n  }\n  return loss;\n}",
            explanation: "多分類的兩個關鍵函數：\n\nSoftmax：\n• 先減去最大值（數值穩定性技巧，防止 e 的大數次方溢出）\n• 取 e 的次方，讓所有值變正\n• 除以總和，讓所有值加起來 = 1\n• 最大的 logit 對應最高的機率\n\n交叉熵：\n• 衡量預測機率分佈和真實分佈的差距\n• 正確類別的預測機率越高，損失越低\n• +1e-8 防止 log(0)"
          },
          {
            title: "步驟二：三層網路架構",
            code: "// 784 → 128 (ReLU) → 64 (ReLU) → 10 (Softmax)\nforward(input) {\n  // 第一層：784→128, ReLU\n  this.a1 = this.z1.map(relu);\n  // 第二層：128→64, ReLU\n  this.a2 = this.z2.map(relu);\n  // 輸出層：64→10, Softmax\n  this.output = softmax(logits);\n}",
            explanation: "三層網路的前向傳播：\n\n1. 輸入層（784）→ 第一隱藏層（128）\n   使用 ReLU 激活，學習基本特徵\n\n2. 第一隱藏層（128）→ 第二隱藏層（64）\n   使用 ReLU 激活，組合成更複雜的特徵\n\n3. 第二隱藏層（64）→ 輸出層（10）\n   使用 Softmax，輸出每個數字的機率"
          },
          {
            title: "步驟三：反向傳播",
            code: "backward(input, target, lr) {\n  // Softmax + CrossEntropy 梯度\n  const dOut = this.output.map((p, i) => p - target[i]);\n  // 逐層反向傳播...\n}",
            explanation: "反向傳播的一個妙處：\n\nSoftmax + 交叉熵的組合梯度非常簡單：\ndOutput = predicted - target\n\n例如：預測 [0.7, 0.2, 0.1]，正確答案 [1, 0, 0]\n梯度 = [-0.3, 0.2, 0.1]\n\n然後梯度逐層往回傳：輸出→第二層→第一層，每層更新自己的權重。這和第 6 章學的反向傳播原理完全一樣，只是多了更多層。"
          },
          {
            title: "步驟四：Mini-batch 訓練與評估",
            code: "for (let b = 0; b < trainData.length; b += batchSize) {\n  const batch = trainData.slice(b, b + batchSize);\n  for (const d of batch) {\n    const pred = model.forward(d.features);\n    model.backward(d.features, d.oneHot, lr);\n  }\n}",
            explanation: "Mini-batch 訓練：\n\n1. 把訓練資料分成每 32 筆一批\n2. 對每批中的每筆資料：前向傳播 → 計算損失 → 反向傳播更新權重\n3. 每個 epoch 結束後，在驗證集上評估準確率\n4. 最後在測試集上做最終評估\n\n觀察訓練過程中準確率的變化——它應該會從約 10%（隨機猜測）逐漸提升到更高的值！"
          }
        ],
      },
      {
        type: "code",
        language: "javascript",
        content: `// 手寫數字辨識——完整實作
function relu(x) { return Math.max(0, x); }
function reluDeriv(x) { return x > 0 ? 1 : 0; }
function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}
function oneHot(label) {
  const v = new Array(10).fill(0);
  v[label] = 1;
  return v;
}

// 生成模擬資料
function genData(n) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const label = Math.floor(Math.random() * 10);
    const feat = new Array(784).fill(0).map((_, j) => {
      const region = Math.floor(j / 78.4);
      if (region === label) return 0.8 + Math.random() * 0.2;
      if (Math.abs(region - label) <= 1) return 0.3 + Math.random() * 0.3;
      return Math.random() * 0.2;
    });
    data.push({ feat, label, oh: oneHot(label) });
  }
  return data;
}

class Net {
  constructor() {
    const s1 = Math.sqrt(2/912), s2 = Math.sqrt(2/192), s3 = Math.sqrt(2/74);
    this.w1 = Array.from({length:128}, () => Array.from({length:784}, () => (Math.random()*2-1)*s1));
    this.b1 = new Array(128).fill(0);
    this.w2 = Array.from({length:64}, () => Array.from({length:128}, () => (Math.random()*2-1)*s2));
    this.b2 = new Array(64).fill(0);
    this.w3 = Array.from({length:10}, () => Array.from({length:64}, () => (Math.random()*2-1)*s3));
    this.b3 = new Array(10).fill(0);
  }
  forward(x) {
    this.z1 = this.b1.map((b,j) => { let s=b; for(let i=0;i<x.length;i++) s+=x[i]*this.w1[j][i]; return s; });
    this.a1 = this.z1.map(relu);
    this.z2 = this.b2.map((b,j) => { let s=b; for(let i=0;i<128;i++) s+=this.a1[i]*this.w2[j][i]; return s; });
    this.a2 = this.z2.map(relu);
    const lg = this.b3.map((b,j) => { let s=b; for(let i=0;i<64;i++) s+=this.a2[i]*this.w3[j][i]; return s; });
    this.out = softmax(lg);
    return this.out;
  }
  backward(x, t, lr) {
    const dO = this.out.map((p,i) => p-t[i]);
    for(let j=0;j<10;j++) { for(let i=0;i<64;i++) this.w3[j][i]-=lr*dO[j]*this.a2[i]; this.b3[j]-=lr*dO[j]; }
    const d2 = new Array(64).fill(0);
    for(let i=0;i<64;i++) { for(let j=0;j<10;j++) d2[i]+=dO[j]*this.w3[j][i]; d2[i]*=reluDeriv(this.z2[i]); }
    for(let j=0;j<64;j++) { for(let i=0;i<128;i++) this.w2[j][i]-=lr*d2[j]*this.a1[i]; this.b2[j]-=lr*d2[j]; }
    const d1 = new Array(128).fill(0);
    for(let i=0;i<128;i++) { for(let j=0;j<64;j++) d1[i]+=d2[j]*this.w2[j][i]; d1[i]*=reluDeriv(this.z1[i]); }
    for(let j=0;j<128;j++) { for(let i=0;i<784;i++) this.w1[j][i]-=lr*d1[j]*x[i]; this.b1[j]-=lr*d1[j]; }
  }
}

const data = genData(500);
for(let i=data.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [data[i],data[j]]=[data[j],data[i]]; }
const train=data.slice(0,350), val=data.slice(350,425), test=data.slice(425);

const net = new Net();
console.log("=== 手寫數字辨識 (784→128→64→10) ===\\n");
for(let e=0;e<15;e++) {
  let loss=0, correct=0;
  for(const d of train) { const p=net.forward(d.feat); loss+=-d.oh.reduce((a,y,i)=>a+y*Math.log(p[i]+1e-8),0); if(p.indexOf(Math.max(...p))===d.label) correct++; net.backward(d.feat,d.oh,0.005); }
  let vc=0; for(const d of val) { const p=net.forward(d.feat); if(p.indexOf(Math.max(...p))===d.label) vc++; }
  if(e%3===0||e===14) console.log(\`Epoch \${e+1}: 損失=\${(loss/350).toFixed(3)}, 訓練=\${(correct/350*100).toFixed(1)}%, 驗證=\${(vc/75*100).toFixed(1)}%\`);
}
let tc=0; for(const d of test) { const p=net.forward(d.feat); if(p.indexOf(Math.max(...p))===d.label) tc++; }
console.log(\`\\n最終測試準確率: \${(tc/test.length*100).toFixed(1)}%\`);`,
        explanation: "這是一個完整的手寫數字辨識專案！使用三層全連接神經網路（784→128→64→10），結合 ReLU 激活、Softmax 輸出和交叉熵損失，通過 mini-batch 訓練來學習辨識 0~9 的數字。",
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "Softmax 函數的主要作用是什麼？",
          options: [
            "讓所有值變成負數",
            "把一組數字轉換成機率分佈（所有值加總為 1）",
            "找出陣列中的最大值",
            "把值壓縮到 -1 到 1 之間",
          ],
          correct: 1,
          explanation: "Softmax 把任意實數轉換成機率分佈——所有值都在 0 到 1 之間，且加總剛好等於 1。最大的輸入值會對應最高的機率。這非常適合多分類問題，因為輸出可以直接解讀為「屬於每個類別的機率」。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "為什麼在 Softmax 計算中要先減去最大值？",
          options: [
            "為了讓結果更不準確",
            "為了數值穩定性——防止 e 的大數次方導致溢出",
            "為了加快計算速度",
            "為了讓所有值變成 0",
          ],
          correct: 1,
          explanation: "如果 logits 中有很大的值（例如 1000），e^1000 會是天文數字，電腦無法處理（溢出）。先減去最大值後，最大的指數變成 e^0 = 1，其他都小於 1，數值安全。而且數學上可以證明，減去常數不影響 Softmax 的結果。",
        }),
      },
      {
        type: "quiz",
        content: JSON.stringify({
          question: "在我們的手寫數字辨識網路中，使用了哪些前面章節學過的技術？",
          options: [
            "只用了反向傳播",
            "ReLU 激活、Xavier 初始化、交叉熵損失、反向傳播、Mini-batch 訓練",
            "只用了梯度下降",
            "只用了感知器",
          ],
          correct: 1,
          explanation: "這個專案綜合運用了幾乎所有前面學到的技術：Xavier 初始化（Ch4）、ReLU 激活函數（Ch3）、前向傳播（Ch4）、交叉熵損失（Ch5）、反向傳播（Ch6）、完整的多層網路結構（Ch7）、資料分割（Ch8），以及 Mini-batch 訓練（Ch9）。這就是深度學習的完整流程！",
        }),
      },
      {
        type: "coding-exercise",
        content: "",
        exercise: {
          title: "練習：實作 Softmax 函數",
          description: "請實作一個 mySoftmax 函數，接收一個數字陣列 logits，回傳 softmax 後的機率分佈。\n\n注意：要先減去最大值以確保數值穩定性！\n\n公式：softmax(z_i) = e^(z_i - max) / Σ(e^(z_j - max))",
          starterCode: `// 請實作 mySoftmax 函數
function mySoftmax(logits) {
  // TODO: 找到最大值
  // TODO: 計算 e^(z_i - max)
  // TODO: 除以總和
}

// 測試
console.log(mySoftmax([2, 1, 0.1]).map(v => v.toFixed(4)).join(", "));
console.log(mySoftmax([1, 1, 1]).map(v => v.toFixed(4)).join(", "));
console.log(mySoftmax([10, 0, 0]).map(v => v.toFixed(4)).join(", "));`,
          solution: `function mySoftmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

console.log(mySoftmax([2, 1, 0.1]).map(v => v.toFixed(4)).join(", "));
console.log(mySoftmax([1, 1, 1]).map(v => v.toFixed(4)).join(", "));
console.log(mySoftmax([10, 0, 0]).map(v => v.toFixed(4)).join(", "));`,
          testCases: [
            { input: "console.log(mySoftmax([2, 1, 0.1]).map(v => v.toFixed(4)).join(', '))", expected: "0.6590, 0.2424, 0.0986" },
            { input: "console.log(mySoftmax([1, 1, 1]).map(v => v.toFixed(4)).join(', '))", expected: "0.3333, 0.3333, 0.3333" },
            { input: "console.log(mySoftmax([10, 0, 0]).map(v => v.toFixed(4)).join(', '))", expected: "0.9999, 0.0000, 0.0000" },
          ],
          hints: [
            "用 Math.max(...logits) 找到最大值",
            "用 map 對每個值計算 Math.exp(v - max)",
            "用 reduce 計算所有 exp 值的總和，然後每個 exp 值除以總和",
          ],
        },
      },
      {
        type: "text",
        content: `## 恭喜你完成了所有 12 個章節！ 🎉🎉🎉

你已經從零開始，完整掌握了神經網路的理論與實作：

### 基礎篇（Ch1-7）
1. **神經元**：接收輸入、加權求和、通過激活函數
2. **感知器**：最簡單的學習單元和線性分類
3. **激活函數**：Sigmoid、ReLU、Tanh 引入非線性
4. **前向傳播**：資料在網路中的流動方式
5. **損失函數**：MSE 和交叉熵衡量預測好壞
6. **反向傳播**：鏈式法則計算梯度、更新權重
7. **完整網路**：從零建構並解決 XOR 問題

### 進階篇（Ch8-12）
8. **過擬合與正則化**：L2、Dropout、早停法
9. **進階優化器**：Momentum、RMSprop、Adam
10. **CNN**：卷積、池化、圖像處理
11. **RNN**：序列處理、隱藏狀態、LSTM
12. **實戰專案**：完整的手寫數字辨識系統

### 下一步？

你現在已經擁有了深度學習的完整基礎！接下來可以探索：
- **框架**：TensorFlow、PyTorch 用更高效的方式實作神經網路
- **Transformer**：GPT、BERT 等大語言模型的基礎架構
- **生成模型**：GAN、Diffusion Model 用於生成圖像
- **強化學習**：讓 AI 學習遊戲和決策

現在前往 **沙盒** 親手操作神經網路吧！你可以拖拉節點、改變權重，看看訊號如何在網路中流動。`,
      },
    ],
    prevChapter: 11,
  },
];

export function getTutorial(id: number): Tutorial | undefined {
  return tutorials.find((t) => t.id === id);
}
