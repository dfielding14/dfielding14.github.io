import katex from "./vendor/katex/katex.mjs";

export function mathOptions(display = false) {
  return {
    displayMode: display,
    output: "htmlAndMathml",
    throwOnError: true,
    // Like trust:false, but throw so rejected commands retain all their source.
    trust: ({ command }) => {
      throw new Error(`${command} is disabled: external links, images, and HTML are not allowed.`);
    },
    strict: false,
    maxExpand: 1000,
    maxSize: 20,
    macros: {},
  };
}

export function renderMath(token, element) {
  try {
    if (token.error) throw new Error(token.error);
    katex.render(token.tex, element, mathOptions(token.display));
    if (token.suffix) element.append(token.suffix);
    return null;
  } catch (error) {
    element.textContent = token.source;
    return `Could not typeset this equation: ${error.message || error}`;
  }
}
