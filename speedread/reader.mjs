const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

function cleanProse(text) {
  const literals = [];
  // Keep code and TeX literal: formatting cleanup must not change their operators.
  text = text.replace(/(`+)([\s\S]*?)\1|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$[^$\n]+\$/g,
    (match, ticks, code) => `\u0000${literals.push(ticks ? code : match) - 1}\u0000`);
  // ponytail: modest Markdown cleanup, not a parser. Keep underscore emphasis
  // intact to preserve identifiers/subscripts; use a parser only for full Markdown.
  text = text
    .replace(/^ {0,3}#{1,6}[ \t]+/gm, "")
    .replace(/^ {0,3}(?:>[ \t]?)+/gm, "")
    .replace(/^[ \t]*(?:[-+*]|\d+[.)])[ \t]+(?:\[[ xX]\][ \t]+)?/gm, "")
    .replace(/^ {0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, "")
    .replace(/!?\[([^\]\n]*)\]\((?:[^()\n]|\([^()\n]*\))*\)/g, "$1")
    .replace(/(?<![\p{L}\p{N}_\\])(\*\*|~~)(?=\S)(.*?\S|\S)\1(?![\p{L}\p{N}_])/gu, "$2")
    .replace(/(?<![\p{L}\p{N}_\\])\*(?=\S)(.*?\S|\S)\*(?![\p{L}\p{N}_])/gu, "$1");
  return text.replace(/\u0000(\d+)\u0000/g, (match, index) => literals[index] ?? match);
}

export function prepareText(raw, cleanMarkdown = true) {
  let text = String(raw ?? "").replace(/\r\n?/g, "\n");
  if (cleanMarkdown) {
    const chunks = [];
    let prose = [];
    let fence = "";
    const flush = () => {
      chunks.push(cleanProse(prose.join("\n")));
      prose = [];
    };
    for (const line of text.split("\n")) {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence) {
        if (marker && marker[1][0] === fence[0]
            && marker[1].length >= fence.length && !marker[2].trim()) {
          fence = "";
        } else {
          chunks.push(line);
        }
      } else if (marker && !marker[2].includes(marker[1][0])) {
        flush();
        fence = marker[1];
      } else {
        prose.push(line);
      }
    }
    flush();
    text = chunks.join("\n");
  }
  return text.replace(/\s+/gu, " ").trim();
}

function escapedAt(text, index) {
  let slashes = 0;
  while (text[--index] === "\\") slashes++;
  return slashes % 2 !== 0;
}

function readMath(text, start) {
  const rest = text.slice(start);
  const environment = rest.match(/^\\begin\{((?:equation|align|gather|multline)\*?)\}/);
  const left = environment?.[0] ?? (rest.startsWith("$$") ? "$$"
    : rest.startsWith("\\(") ? "\\(" : rest.startsWith("\\[") ? "\\["
      : rest.startsWith("$") && rest.length > 1 ? "$" : null);
  if (!left) return null;
  // A trailing currency symbol or escaped opener is not a new formula.
  if (left === "$" && /\S/.test(text[start - 1] ?? " ") && /^[\s.,;:!?)\]}]/.test(rest[1])) return null;
  const right = environment ? `\\end{${environment[1]}}`
    : left === "\\(" ? "\\)" : left === "\\[" ? "\\]" : left;
  const bodyStart = start + left.length;
  const numericDollar = left === "$" && /^\$[ \t]*[+-]?(?:\d|[.,]\d)/.test(rest);
  const stack = environment ? [environment[1]] : [];
  let boundary = text.length;
  let depth = 0;
  const finish = (end, bodyEnd, error) => {
    const suffix = /^[,.;:!?…)”’»]+/u.exec(text.slice(end))?.[0] ?? "";
    return {
      end: end + suffix.length,
      token: {
        type: "math",
        tex: environment ? text.slice(start, end) : text.slice(bodyStart, bodyEnd),
        display: left !== "$" && left !== "\\(",
        source: text.slice(start, end + suffix.length),
        ...(error ? { error } : {}),
        ...(suffix ? { suffix } : {}),
      },
    };
  };
  for (let i = bodyStart; i < text.length; i++) {
    if (boundary === text.length && (text[i] === "\n" || text[i] === "\r")
        && /^\r?\n[ \t]*\r?\n/.test(text.slice(i))) boundary = i;
    if (escapedAt(text, i)) continue;
    // Check competing prices before brace depth; prose braces must not make
    // every currency amount scan the entire remaining document.
    if (numericDollar && text[i] === "$" && (/\d/.test(text[i + 1] ?? "")
        || /\s/.test(text[i - 1]) && /\S/.test(text[i + 1] ?? " "))) return null;
    if (text[i] === "%") {
      const newline = text.indexOf("\n", i);
      i = newline < 0 ? text.length : newline - 1;
      continue;
    }
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth = Math.max(0, depth - 1);
    const env = text[i] === "\\" && /^\\(begin|end)\{([A-Za-z]+\*?)\}/.exec(text.slice(i));
    if (env) {
      if (env[1] === "begin") stack.push(env[2]);
      else if (stack.at(-1) !== env[2]) {
        return finish(i + env[0].length, i, `Mismatched environment: expected ${stack.length ? `\\end{${stack.at(-1)}}` : right}, found ${env[0]}.`);
      } else {
        stack.pop();
        if (environment && !stack.length) return finish(i + env[0].length, i);
      }
      i += env[0].length - 1;
      continue;
    }
    if (depth) continue;
    const close = text.startsWith("\\)", i) ? "\\)" : text.startsWith("\\]", i) ? "\\]"
      : text[i] === "$" ? left === "$" ? "$" : text.startsWith("$$", i) ? "$$" : "$" : null;
    if (!close) continue;
    // ponytail: dollar currency is ambiguous. Treat a numeric opener as math
    // only with a paired closing dollar; explicit TeX delimiters avoid ambiguity.
    if (numericDollar && close !== "$") return null;
    if (close === right) return finish(i + close.length, i);
    return finish(i + close.length, i, `Mismatched math delimiter: expected ${right}, found ${close}.`);
  }
  if (numericDollar) return null;
  return finish(boundary, boundary, `Missing closing ${right}. Fix the source; the equation was not changed.`);
}

export function isMath(token) {
  return token !== null && typeof token === "object" && token.type === "math";
}

export function tokenText(token) {
  return isMath(token) ? token.source : String(token ?? "");
}

export function tokenize(raw, cleanMarkdown = true) {
  const text = String(raw ?? "");
  let marker = "\uE000math:";
  while (text.includes(marker)) marker += ":";
  const protectedMath = new Map();
  const chunks = [];
  let copied = 0;
  for (let i = 0; i < text.length;) {
    if (!i || text[i - 1] === "\n") {
      const fence = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)/.exec(text.slice(i));
      if (fence && !fence[2].includes(fence[1][0])) {
        const closing = new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}[ \\t]*\\r?$`, "gm");
        closing.lastIndex = i + fence[0].length;
        const end = closing.exec(text);
        i = end ? end.index + end[0].length : text.length;
        continue;
      }
    }
    if (text[i] === "`" && !escapedAt(text, i)) {
      const ticks = /^`+/.exec(text.slice(i))[0];
      const closing = /`+/g;
      closing.lastIndex = i + ticks.length;
      let end;
      while ((end = closing.exec(text)) && end[0].length !== ticks.length) {}
      i = end ? end.index + end[0].length : i + ticks.length;
      continue;
    }
    const math = (text[i] === "$" || text[i] === "\\") && !escapedAt(text, i) && readMath(text, i);
    if (math) {
      const key = `${marker}${protectedMath.size}\uE001`;
      protectedMath.set(key, math.token);
      chunks.push(text.slice(copied, i), key);
      copied = i = math.end;
    } else i++;
  }
  chunks.push(text.slice(copied));
  const prose = prepareText(chunks.join(""), cleanMarkdown);
  return prose.split(new RegExp(`(${marker}\\d+\uE001)`)).flatMap(chunk =>
    protectedMath.has(chunk) ? [protectedMath.get(chunk)] : chunk.split(" ").filter(Boolean));
}

export function focusParts(word) {
  const text = String(word ?? "");
  const chars = segmenter
    ? Array.from(segmenter.segment(text), item => item.segment)
    : Array.from(text);
  const letters = chars.flatMap((char, index) => /[\p{L}\p{N}]/u.test(char) ? [index] : []);
  const candidates = letters.length ? letters : chars.map((_, index) => index);
  const index = candidates[Math.floor(candidates.length / 3)] ?? 0;
  return {
    before: chars.slice(0, index).join(""),
    focus: chars[index] ?? "",
    after: chars.slice(index + 1).join(""),
  };
}

export function wordDelay(word, wpm = 300, pauses = true) {
  const speed = Number(wpm);
  const base = 60000 / Math.min(1000, Math.max(100, Number.isNaN(speed) ? 300 : speed));
  if (isMath(word)) {
    const size = (word.tex.match(/\\[A-Za-z]+|[^\s{}\\]/g) ?? []).length;
    return Math.max(word.display ? 1500 : 500, base * Math.min(12, 2 + size / 6));
  }
  if (!pauses) return base;
  const text = String(word ?? "");
  const ending = text.trimEnd().replace(/["'”’»\)\]}]+$/u, "");
  if (/[.!?…]$/u.test(ending) || /\n/.test(text)) return base * 1.6;
  if (/[,;:]$/u.test(ending)) return base * 1.25;
  return base;
}

export function formatTime(seconds) {
  const value = Number(seconds);
  const total = Number.isFinite(value) ? Math.max(0, Math.ceil(value)) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
