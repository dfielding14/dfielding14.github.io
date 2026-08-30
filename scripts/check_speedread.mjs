import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { prepareText, tokenize, isMath, tokenText, focusParts, wordDelay, formatTime } from "../speedread/reader.mjs";
import katex from "../speedread/vendor/katex/katex.mjs";
import { mathOptions } from "../speedread/math.mjs";

assert.equal(prepareText(null), "");
assert.deepEqual(tokenize(" \n\t "), []);
assert.deepEqual(tokenize("first\u00a0second\r\nthird"), ["first", "second", "third"]);
assert.equal(prepareText("# Heading\n> **Bold** and *italic*, ~~old~~.\n- [Link](https://example.test/a_(b))\n1. [x] Done"),
  "Heading Bold and italic, old. Link Done");
assert.equal(prepareText("**outer *inner* outer**"), "outer inner outer");
assert.equal(prepareText("**Keep**\n`x_i`", false), "**Keep** `x_i`");

const code = "x_i = a * b; // **literal**\n# not a heading\nreturn '<img onerror=alert(1)>';";
assert.equal(prepareText("Before\n```python\n" + code + "\n```\nAfter"),
  "Before " + code.replace(/\s+/g, " ") + " After");
assert.equal(prepareText("~~~js\nconst x = `**code**`;\n~~~~"), "const x = `**code**`;");
assert.equal(prepareText("```python\n# preserve unfinished code\na_b = 2**3"),
  "# preserve unfinished code a_b = 2**3");
assert.equal(prepareText("Use `x_i * y_j`, snake_case and __init__."),
  "Use x_i * y_j, snake_case and __init__.");
const math = String.raw`$x_i * y_j$ and $$T_{ij} = \alpha * \beta$$ and \(a_b\) and \[c_d\]`;
assert.equal(prepareText(math), math);
assert.equal(prepareText("a*b*c and 2 * 3 * 4"), "a*b*c and 2 * 3 * 4");
assert.equal(prepareText("<script>alert('text only')</script>"), "<script>alert('text only')</script>");

const inline = { type: "math", tex: "x_i * y_j", display: false, source: "$x_i * y_j$" };
assert.deepEqual(tokenize("Before $x_i * y_j$ after"), ["Before", inline, "after"]);
assert.deepEqual(tokenize("**Before** $x_i * y_j$ after", false), ["**Before**", inline, "after"]);
assert.deepEqual(tokenize("**$x_i * y_j$**"), [inline]);
assert.deepEqual(tokenize("[$x_i * y_j$](https://example.test)"), [inline]);
assert.deepEqual(tokenize("$x_i * y_j$$x_i * y_j$"), [inline, inline]);
for (const [left, right, display] of [["$", "$", false], ["$$", "$$", true], ["\\(", "\\)", false], ["\\[", "\\]", true]]) {
  const tex = String.raw` x_i = \frac{a * b}{2} `;
  const source = left + tex + right;
  assert.deepEqual(tokenize(source), [{ type: "math", tex, display, source }]);
}
assert.deepEqual(tokenize("a$x$b, $y$,$z$."), ["a", {
  type: "math", tex: "x", display: false, source: "$x$",
}, "b,", {
  type: "math", tex: "y", display: false, source: "$y$,", suffix: ",",
}, {
  type: "math", tex: "z", display: false, source: "$z$.", suffix: ".",
}]);
const multiline = "\r\nx_i = \\frac{a}{b} % $$ and \\] are comments\r\n + \\alpha \\% \\left( y \\right)\r\n";
assert.deepEqual(tokenize("Before $$" + multiline + "$$ after"), ["Before", {
  type: "math", tex: multiline, display: true, source: "$$" + multiline + "$$",
}, "after"]);
for (const [left, right] of [["$$", "$$"], ["\\[", "\\]"]]) {
  const tex = "\n\nx = y\n\n+ z % a comment\n\n\n";
  const source = left + tex + right;
  assert.deepEqual(tokenize(source), [{ type: "math", tex, display: true, source }]);
}
const matrix = String.raw`\begin{align*}
A &= \begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix} \\
f(x) &= \begin{cases}x^2 & x > 0 \\ 0 & x \le 0\end{cases}
\end{align*}`;
assert.deepEqual(tokenize(matrix), [{ type: "math", tex: matrix, display: true, source: matrix }]);
for (const env of ["equation", "equation*", "align", "gather", "gather*", "multline", "multline*"]) {
  const source = `\\begin{${env}}\nx = y\n\\end{${env}}`;
  assert.deepEqual(tokenize(source), [{ type: "math", tex: source, display: true, source }]);
}
const aligned = String.raw`\[\begin{aligned}a &= b \\ c &= d\end{aligned}\]`;
assert.equal(tokenize(aligned)[0].tex, aligned.slice(2, -2));
assert.equal(tokenize(String.raw`\(\text{The variable $x$ is positive}\)`)[0].tex, String.raw`\text{The variable $x$ is positive}`);
for (const literal of ["Pay $5 and $10.", "It costs $1,200.50 or $-5.", String.raw`Pay \$5 and \$10; the symbol is \$.`]) {
  assert.deepEqual(tokenize(literal), literal.split(" "));
}
assert.deepEqual(tokenize("Pay $5; then use $x$."), ["Pay", "$5;", "then", "use", {
  type: "math", tex: "x", display: false, source: "$x$.", suffix: ".",
}]);
assert.equal(tokenize("$2 + 3$")[0].tex, "2 + 3");
assert.equal(tokenize("$5$")[0].tex, "5");
for (const pattern of ["$5 ", "$5 {"]) {
  const currency = pattern.repeat(2000);
  assert.deepEqual(tokenize(currency), prepareText(currency).split(" "));
}
for (const cleanup of [true, false]) {
  for (const literal of ["`$x$ and \\(y\\)`", "``Literal `$x$` here``", "```tex\n$$x$$\n```", "~~~tex\n\\[x\\]\n~~~", "```tex\n$unfinished"]) {
    assert.equal(tokenize(literal, cleanup).some(isMath), false);
  }
}
assert.deepEqual(tokenize("`$x$` then $x$"), ["$x$", "then", { type: "math", tex: "x", display: false, source: "$x$" }]);
for (const source of ["$x + y", "$$x + y", "\\(x + y", "\\[x + y", "\\begin{align}x &= y"]) {
  const [mathError, ...after] = tokenize(source + "\n\nStill ordinary prose.");
  assert.ok(isMath(mathError));
  assert.match(mathError.error, /Missing closing/);
  assert.equal(mathError.source, source);
  assert.deepEqual(after, ["Still", "ordinary", "prose."]);
}
for (const source of ["\\(x\\]", "\\[x\\)", "$$x$", "\\begin{align}x\\end{equation}"]) {
  const [mathError] = tokenize(source);
  assert.ok(isMath(mathError));
  assert.match(mathError.error, /Mismatched/);
  assert.equal(mathError.source, source);
}
const malformedExample = "$$\nx=y^2 + \\log \\left( T/4 \\right)\n##";
const [exampleError, ...afterExample] = tokenize(malformedExample + "\n\nThis is your local reading room...");
assert.equal(exampleError.source, malformedExample);
assert.equal(exampleError.tex, malformedExample.slice(2));
assert.match(exampleError.error, /Missing closing \$\$/);
assert.deepEqual(afterExample, ["This", "is", "your", "local", "reading", "room..."]);
const dangerous = String.raw`\[\href{javascript:alert(1)}{<img onerror=alert(1)>}\]`;
assert.equal(tokenText(tokenize(dangerous)[0]), dangerous);
assert.equal(tokenText("plain"), "plain");
assert.equal(tokenText(null), "");
assert.equal(isMath(null), false);
assert.equal(isMath("math"), false);

assert.deepEqual(focusParts(""), { before: "", focus: "", after: "" });
assert.deepEqual(focusParts("“hello,”"), { before: "“h", focus: "e", after: "llo,”" });
assert.deepEqual(focusParts("e\u0301"), { before: "", focus: "e\u0301", after: "" });
assert.deepEqual(focusParts("👩🏽‍🔬"), { before: "", focus: "👩🏽‍🔬", after: "" });
for (const word of ["(reading)", "⚡️fast", "a-b", "中文测试", "!!!"]) {
  const { before, focus, after } = focusParts(word);
  assert.equal(before + focus + after, word);
  assert.ok(focus);
}

assert.equal(wordDelay("plain", 300), 200);
assert.equal(wordDelay("comma,", 300), 250);
assert.equal(wordDelay("sentence.”", 300), 320);
assert.equal(wordDelay("paragraph\n", 300), 320);
assert.equal(wordDelay("sentence.", 300, false), 200);
assert.equal(wordDelay("3.14", 300), 200);
assert.equal(wordDelay("plain", 0), 600);
assert.equal(wordDelay("plain", 5000), 60);
assert.equal(wordDelay("plain", "invalid"), 200);
assert.ok(wordDelay(inline, 300) > wordDelay("plain", 300));
assert.ok(wordDelay(inline, 1000, false) >= 500);
assert.ok(wordDelay(tokenize(matrix)[0], 1000, false) >= 1500);
assert.ok(wordDelay(tokenize(matrix)[0], 100) > wordDelay(tokenize("$x$")[0], 100));
assert.equal(formatTime(0), "0:00");
assert.equal(formatTime(59.1), "1:00");
assert.equal(formatTime(3661), "61:01");
assert.equal(formatTime(-10), "0:00");
assert.equal(formatTime(Infinity), "0:00");


{

assert.equal(katex.version, "0.18.4");
for (const [tex, marker] of [
  [String.raw`\frac{a+b}{c}`, /<mfrac>/],
  [String.raw`x_i^2`, /<msubsup>/],
  [String.raw`\log(1+x)`, />log<\/mi>/],
  [String.raw`\int_0^1 x^2\,dx`, /∫/],
  [String.raw`\begin{align}a&=b+c\\d&=e\end{align}`, /<mtable/],
  [String.raw`\begin{align*}a&=b+c\\d&=e\end{align*}`, /<mtable/],
  [String.raw`\begin{equation}E=mc^2\end{equation}`, /<msup>/],
  [String.raw`\begin{gather}a=b\\c=d\end{gather}`, /<mtable/],
  [String.raw`\begin{pmatrix}1&2\\3&4\end{pmatrix}`, /<mtable/],
]) {
  const html = katex.renderToString(tex, mathOptions(true));
  assert.match(html, /class="katex-display"/, tex);
  assert.match(html, /class="katex-mathml"/, tex);
  assert.match(html, /class="katex-html" aria-hidden="true"/, tex);
  assert.match(html, marker, tex);
}
assert.doesNotMatch(katex.renderToString("x", mathOptions()), /katex-display/);

for (const tex of [String.raw`\frac{1}{`, String.raw`\notARealCommand{x}`,
  String.raw`\begin{multline}a=b\\c=d\end{multline}`]) {
  assert.throws(() => katex.renderToString(tex, mathOptions(true)), katex.ParseError);
}
for (const tex of [
  String.raw`\href{javascript:alert(1)}{click}`,
  String.raw`\url{https://example.com}`,
  String.raw`\includegraphics{https://example.com/image.png}`,
  String.raw`\htmlStyle{position:fixed}{x}`,
  String.raw`\htmlClass{hidden}{x}`,
  String.raw`\htmlId{source}{x}`,
  String.raw`\htmlData{key=value}{x}`,
  String.raw`\def\link{\href{https://example.com}{x}}\link`,
]) {
  assert.throws(() => katex.renderToString(tex, mathOptions()), /disabled/, tex);
}

assert.throws(() => katex.renderToString(String.raw`\def\loop{\loop}\loop`, mathOptions()), /Too many expansions/);
assert.match(katex.renderToString(String.raw`\rule{100em}{100em}`, mathOptions()), /height:20em/);
katex.renderToString(String.raw`\gdef\saved{x}\saved`, mathOptions());
assert.throws(() => katex.renderToString(String.raw`\saved`, mathOptions()), /Undefined control sequence/);
assert.doesNotMatch(katex.renderToString(String.raw`\text{<script>alert(1)</script>}`, mathOptions()), /<script>/);

const css = readFileSync(new URL("../speedread/vendor/katex/katex.min.css", import.meta.url), "utf8");
for (const [, path] of css.matchAll(/url\(([^)]+)\)/g)) {
  assert.ok(path.startsWith("fonts/"), "Fonts must remain same-origin.");
  assert.ok(existsSync(new URL(`../speedread/vendor/katex/${path}`, import.meta.url)), path);
}

}

const root = fileURLToPath(new URL("../", import.meta.url));
const built = join(root, "_site");
const app = join(built, "speedread");
assert.ok(existsSync(app), "Build the Jekyll site before checking SpeedReader.");
for (const name of ["index.html", "styles.css", "app.js", "reader.mjs", "math.mjs", "pdf.mjs", "fonts/Manrope-Variable.ttf", "fonts/Syne-Variable.ttf", "vendor/katex/katex.mjs", "vendor/katex/katex.min.css"]) {
  assert.ok(existsSync(join(app, name)), `Missing published SpeedReader asset: ${name}`);
}
const html = readFileSync(join(app, "index.html"), "utf8");
assert.match(html, /^<!doctype html>/i, "SpeedReader must keep its standalone layout.");
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.match(html, /worker-src 'self'/);
for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (url.startsWith("data:")) continue;
  assert.ok(url.startsWith("./"), `App asset must be relative: ${url}`);
  assert.ok(existsSync(resolve(app, url)), `Missing app reference: ${url}`);
}
assert.ok(!readFileSync(join(built, "sitemap.xml"), "utf8").includes("/speedread"), "Do not list SpeedReader in the sitemap.");
assert.ok(!readFileSync(join(root, "_data/navigation.yml"), "utf8").includes("speedread"), "Do not add SpeedReader to navigation.");
function checkUnlinked(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (path === app) continue;
    if (entry.isDirectory()) checkUnlinked(path);
    else if (entry.name.endsWith(".html")) {
      assert.doesNotMatch(readFileSync(path, "utf8"), /href=["'][^"']*\/speedread(?:\/|["'])/i, `Unexpected public link in ${path}`);
    }
  }
}
checkUnlinked(built);
assert.ok(!existsSync(join(app, "server.py")), "Do not publish the local server.");
console.log("SpeedReader checks passed: text handling, built assets, standalone layout, and unlinked/noindex page.");
