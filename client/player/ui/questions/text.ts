import Dom from "../../../dom.js";

export default class TextQuestion {
  #wrap: HTMLElement;

  #input: HTMLInputElement;

  #button: HTMLButtonElement;

  constructor(parent: HTMLElement, callback: (value: string) => void) {
    const w = Dom.div(undefined, "textanswerwrap");

    this.#input = Dom.input(
      "text",
      "<Insert Stunning Insight Here>",
      undefined,
      "card",
    );
    this.#input.setAttribute("autocomplete", "off");
    this.#input.setAttribute("autocapitalize", "off");
    this.#input.setAttribute("spellcheck", "false");
    this.#input.setAttribute("autocorrect", "off");
    w.appendChild(this.#input);

    this.#button = Dom.button(
      "Confirm",
      () => {
        callback(this.#input.value);
      },
      "bigbtn",
    );
    w.appendChild(this.#button);

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.appendChild(w);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#input.style.transform = "scaleX(1)";
      this.#button.style.opacity = "1";
    });
  }

  async remove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
