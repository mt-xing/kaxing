import Dom from "../../../dom.js";

export default class TypeQuestion {
  #wrap: HTMLElement;

  #input: HTMLInputElement;

  #button: HTMLButtonElement;

  #send: () => void;

  constructor(parent: HTMLElement, callback: (value: string) => void) {
    this.#send = () => callback(this.#input.value);

    const w = Dom.div(undefined, "textanswerwrap");

    const instr = Dom.p("Type your answer below", "instr");
    w.appendChild(instr);

    const form = document.createElement("FORM");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.remove();
    });

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
    form.appendChild(this.#input);

    this.#button = Dom.button("Submit", () => {}, "bigbtn");
    form.appendChild(this.#button);

    w.appendChild(form);

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.appendChild(w);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#input.style.transform = "scaleX(1)";
      this.#button.style.opacity = "1";
      instr.style.opacity = "1";
    });
  }

  async remove() {
    this.#input.disabled = true;
    this.#button.disabled = true;
    this.#button.blur();
    this.#send();

    setTimeout(this.#fullRemove.bind(this), 100);
  }

  async #fullRemove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
