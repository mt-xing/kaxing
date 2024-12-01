import Dom from "../../dom.js";

export default class TextUi {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, text: string) {
    const wrap = Dom.div(undefined, "questionRes");
    wrap.appendChild(Dom.p(text));

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      window.setTimeout(() => {
        wrap.style.transform = "translateY(0)";
      }, 500);
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
