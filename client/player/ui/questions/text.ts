import Dom from "../../../dom.js";

export default class TextQuestion {
  #wrap: HTMLElement;

  #input: HTMLInputElement;

  #button: HTMLButtonElement;

  #send: (isFinal: boolean) => void;

  #cooldown?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    callback: (value: string, isFinal: boolean) => void,
  ) {
    this.#send = (isFinal) => callback(this.#input.value, isFinal);

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
    this.#input.addEventListener("input", () => {
      if (this.#cooldown !== undefined) {
        return;
      } else {
        this.#cooldown = setTimeout(() => {
          this.#send(false);
          this.#cooldown = undefined;
        }, 500);
      }
    });
    w.appendChild(this.#input);

    this.#button = Dom.button(
      "Submit",
      this.#sendFinalAnswer.bind(this),
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

  #sendFinalAnswer() {
    this.#input.disabled = true;
    this.#button.disabled = true;
    this.#button.blur();
    this.#send(true);
    if (this.#cooldown !== undefined) {
      clearTimeout(this.#cooldown);
      this.#cooldown = undefined;
    }

    setTimeout(this.remove.bind(this), 250);
  }

  async remove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
