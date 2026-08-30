import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { prepareText, tokenize, focusParts, wordDelay, formatTime } from "../speedread/reader.mjs";

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
assert.equal(formatTime(0), "0:00");
assert.equal(formatTime(59.1), "1:00");
assert.equal(formatTime(3661), "61:01");
assert.equal(formatTime(-10), "0:00");
assert.equal(formatTime(Infinity), "0:00");

const root = fileURLToPath(new URL("../", import.meta.url));
const built = join(root, "_site");
const app = join(built, "speedread");
assert.ok(existsSync(app), "Build the Jekyll site before checking SpeedReader.");
for (const name of ["index.html", "styles.css", "app.js", "reader.mjs", "pdf.mjs"]) {
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
