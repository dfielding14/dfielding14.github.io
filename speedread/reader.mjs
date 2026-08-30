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

export function tokenize(raw, cleanMarkdown = true) {
  const text = prepareText(raw, cleanMarkdown);
  return text ? text.split(" ") : [];
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
