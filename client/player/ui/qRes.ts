import Dom from "../../dom.js";

export default class QuestionResponse {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, correct: boolean, text: string) {
    const wrap = Dom.div(undefined, "questionRes");
    wrap.appendChild(Dom.h2(correct ? "✅" : "🚫"));
    wrap.appendChild(Dom.p(text));

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
