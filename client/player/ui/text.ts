import Dom from "../../dom.js";

export default class Text {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, text: string) {
    const wrap = Dom.div(undefined, "questionRes");
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