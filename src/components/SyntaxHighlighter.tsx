"use client";

import React from "react";

// Token types matching VS Code Dark+ theme
type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "class"
  | "operator"
  | "punctuation"
  | "property"
  | "parameter"
  | "builtin"
  | "constant"
  | "template"
  | "regex"
  | "text";

interface Token {
  type: TokenType;
  value: string;
}

// VS Code Dark+ inspired colors
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "#c586c0",       // pink-purple for control flow
  string: "#ce9178",        // orange-brown
  number: "#b5cea8",        // light green
  comment: "#6a9955",       // green
  function: "#dcdcaa",      // yellow
  class: "#4ec9b0",         // teal
  operator: "#d4d4d4",      // light gray
  punctuation: "#d4d4d4",   // light gray
  property: "#9cdcfe",      // light blue
  parameter: "#9cdcfe",     // light blue
  builtin: "#4fc1ff",       // bright blue
  constant: "#4fc1ff",      // bright blue
  template: "#ce9178",      // orange-brown
  regex: "#d16969",         // red
  text: "#d4d4d4",          // default light gray
};

const KEYWORDS = new Set([
  "break", "case", "catch", "continue", "debugger", "default", "delete",
  "do", "else", "finally", "for", "function", "if", "in", "instanceof",
  "new", "return", "switch", "this", "throw", "try", "typeof", "var",
  "void", "while", "with", "class", "const", "let", "export", "import",
  "extends", "super", "yield", "async", "await", "static", "from", "of",
]);

const CONTROL_KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "break",
  "continue", "return", "throw", "try", "catch", "finally", "yield",
  "await", "async", "import", "export", "from", "default", "new",
  "delete", "typeof", "void", "instanceof", "in", "of",
]);

const DECLARATION_KEYWORDS = new Set([
  "var", "let", "const", "function", "class", "extends", "super", "static", "this",
]);

const BUILTINS = new Set([
  "console", "Math", "JSON", "Array", "Object", "String", "Number",
  "Boolean", "Date", "RegExp", "Error", "Promise", "Map", "Set",
  "parseInt", "parseFloat", "isNaN", "isFinite", "undefined", "NaN",
  "Infinity", "null", "true", "false", "window", "document", "globalThis",
]);

const CONSTANTS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    // Whitespace
    if (/\s/.test(code[i])) {
      let start = i;
      while (i < len && /\s/.test(code[i])) i++;
      tokens.push({ type: "text", value: code.slice(start, i) });
      continue;
    }

    // Single-line comment
    if (code[i] === "/" && code[i + 1] === "/") {
      let start = i;
      while (i < len && code[i] !== "\n") i++;
      tokens.push({ type: "comment", value: code.slice(start, i) });
      continue;
    }

    // Multi-line comment
    if (code[i] === "/" && code[i + 1] === "*") {
      let start = i;
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      tokens.push({ type: "comment", value: code.slice(start, i) });
      continue;
    }

    // Template literal
    if (code[i] === "`") {
      let start = i;
      i++;
      let result = "`";
      while (i < len && code[i] !== "`") {
        if (code[i] === "$" && code[i + 1] === "{") {
          // End current template string part
          if (result.length > 1) {
            tokens.push({ type: "template", value: result });
            result = "";
          }
          tokens.push({ type: "punctuation", value: "${" });
          i += 2;
          // Tokenize inside the expression until matching }
          let depth = 1;
          let expr = "";
          while (i < len && depth > 0) {
            if (code[i] === "{") depth++;
            if (code[i] === "}") {
              depth--;
              if (depth === 0) break;
            }
            expr += code[i];
            i++;
          }
          // Tokenize the expression content
          const innerTokens = tokenize(expr);
          tokens.push(...innerTokens);
          tokens.push({ type: "punctuation", value: "}" });
          i++; // skip }
          continue;
        }
        if (code[i] === "\\") {
          result += code[i] + (code[i + 1] || "");
          i += 2;
          continue;
        }
        result += code[i];
        i++;
      }
      result += "`";
      i++; // skip closing `
      if (result.length > 0) {
        tokens.push({ type: "template", value: result });
      }
      continue;
    }

    // String (single or double quote)
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let start = i;
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\\") i++; // skip escaped char
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: "string", value: code.slice(start, i) });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) || (code[i] === "." && i + 1 < len && /[0-9]/.test(code[i + 1]))) {
      let start = i;
      if (code[i] === "0" && (code[i + 1] === "x" || code[i + 1] === "X")) {
        i += 2;
        while (i < len && /[0-9a-fA-F]/.test(code[i])) i++;
      } else {
        while (i < len && /[0-9.]/.test(code[i])) i++;
        if (i < len && (code[i] === "e" || code[i] === "E")) {
          i++;
          if (i < len && (code[i] === "+" || code[i] === "-")) i++;
          while (i < len && /[0-9]/.test(code[i])) i++;
        }
      }
      tokens.push({ type: "number", value: code.slice(start, i) });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      let start = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const word = code.slice(start, i);

      // Look ahead for function call
      let j = i;
      while (j < len && /\s/.test(code[j])) j++;

      if (CONSTANTS.has(word)) {
        tokens.push({ type: "constant", value: word });
      } else if (BUILTINS.has(word)) {
        tokens.push({ type: "builtin", value: word });
      } else if (DECLARATION_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
        // Color the next identifier differently for declarations
        // "class Foo" → Foo is class color; "function bar" → bar is function color
      } else if (CONTROL_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (code[j] === "(") {
        // Function call
        tokens.push({ type: "function", value: word });
      } else {
        // Check if previous non-whitespace token context helps
        const prev = findPrevToken(tokens);
        if (prev && (prev.value === "function" || prev.value === "class")) {
          tokens.push({ type: prev.value === "class" ? "class" : "function", value: word });
        } else if (prev && prev.value === ".") {
          // Property access
          if (code[j] === "(") {
            tokens.push({ type: "function", value: word });
          } else {
            tokens.push({ type: "property", value: word });
          }
        } else if (prev && (prev.value === "new")) {
          tokens.push({ type: "class", value: word });
        } else {
          tokens.push({ type: "property", value: word }); // variable → light blue
        }
      }
      continue;
    }

    // Operators and punctuation
    const op2 = code.slice(i, i + 2);
    const op3 = code.slice(i, i + 3);

    if (["===", "!==", ">>>", "...", "**="].includes(op3)) {
      tokens.push({ type: "operator", value: op3 });
      i += 3;
      continue;
    }
    if (["==", "!=", "<=", ">=", "&&", "||", "**", "=>", "+=", "-=", "*=", "/=", "++", "--", "<<", ">>", "??"].includes(op2)) {
      tokens.push({ type: "operator", value: op2 });
      i += 2;
      continue;
    }
    if ("+-*/%=<>!&|^~?".includes(code[i])) {
      tokens.push({ type: "operator", value: code[i] });
      i++;
      continue;
    }
    if ("(){}[];:,.".includes(code[i])) {
      tokens.push({ type: "punctuation", value: code[i] });
      i++;
      continue;
    }

    // Fallback
    tokens.push({ type: "text", value: code[i] });
    i++;
  }

  return tokens;
}

function findPrevToken(tokens: Token[]): Token | null {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type !== "text" || tokens[i].value.trim() !== "") {
      return tokens[i];
    }
  }
  return null;
}

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md text-xs transition-all z-10"
      style={{
        background: copied ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.05)",
        color: copied ? "rgb(52, 211, 153)" : "rgba(255,255,255,0.3)",
        border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
      }}
      title="複製程式碼"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

// Render highlighted code as React elements
export function HighlightedCode({ code, className = "" }: { code: string; className?: string }) {
  const tokens = tokenize(code);

  return (
    <div className="relative group">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
      <pre className={`text-sm font-mono leading-[1.7] overflow-x-auto ${className}`}>
        <code>
          {tokens.map((token, i) => (
            <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

// Overlay-based highlighted editor: transparent textarea on top of highlighted pre
export function HighlightedEditor({
  code,
  onChange,
  minHeight = "200px",
}: {
  code: string;
  onChange: (value: string) => void;
  minHeight?: string;
}) {
  const tokens = tokenize(code);
  const lineCount = code.split("\n").length;

  return (
    <div className="flex code-editor">
      {/* Line numbers */}
      <div
        className="select-none text-right pr-3 pl-3 py-4 text-sm leading-[1.7] border-r border-[var(--border)]"
        style={{ color: "rgba(224, 224, 232, 0.25)", background: "rgba(14, 14, 26, 0.5)" }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code area: highlighted pre + transparent textarea overlay */}
      <div className="flex-1 relative" style={{ minHeight }}>
        {/* Highlighted display layer */}
        <pre
          className="absolute inset-0 p-4 text-sm font-mono leading-[1.7] overflow-hidden pointer-events-none whitespace-pre-wrap break-words"
          aria-hidden="true"
        >
          <code>
            {tokens.map((token, i) => (
              <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
                {token.value}
              </span>
            ))}
            {/* Trailing newline to match textarea scroll height */}
            {"\n"}
          </code>
        </pre>

        {/* Editable textarea layer */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="relative w-full h-full p-4 bg-transparent font-mono text-sm leading-[1.7] resize-none outline-none caret-[var(--secondary)] whitespace-pre-wrap break-words"
          style={{
            color: "transparent",
            caretColor: "var(--secondary)",
            minHeight,
            tabSize: 2,
            WebkitTextFillColor: "transparent",
          }}
        />
      </div>
    </div>
  );
}
