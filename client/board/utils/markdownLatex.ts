// @ts-ignore
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
// @ts-ignore
import markedKatex from "../deps/marked-katex.js";

marked.use(markedKatex({ throwOnError: false }));

export function renderMdLatexToHtml(str: string) {
  return marked.parseInline(str);
}

export function renderMdLatexToP(str: string) {
  const p = document.createElement("P");
  p.innerHTML = renderMdLatexToHtml(str);
  return p;
}

export function renderMdLatexToSpan(str: string) {
  const p = document.createElement("SPAN");
  p.innerHTML = renderMdLatexToHtml(str);
  return p;
}
