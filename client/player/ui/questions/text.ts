import Dom from "../../../dom.js";

export default class TextQuestion {
  #wrap: HTMLElement;

  #input: HTMLInputElement;

  #button: HTMLButtonElement;

  #send: () => void;

  #cooldown?: ReturnType<typeof setTimeout>;

  #locked: boolean;

  constructor(parent: HTMLElement, callback: (value: string) => void) {
    this.#send = () => callback(this.#input.value);
    this.#locked = false;

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
          this.#send();
          this.#cooldown = undefined;
        }, 250);
      }
    });
    w.appendChild(this.#input);

    this.#button = Dom.button("Confirm", this.#toggleLock.bind(this), "bigbtn");
    w.appendChild(this.#button);

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.appendChild(w);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#input.style.transform = "scaleX(1)";
      this.#button.style.opacity = "1";
    });
  }

  #toggleLock() {
    if (this.#locked) {
      this.#input.disabled = false;
      this.#button.textContent = "Confirm";
      this.#locked = false;
      this.#input.focus();
    } else {
      this.#input.disabled = true;
      this.#button.textContent = "Edit Answer";
      this.#locked = true;
      this.#button.blur();
      this.#send();
      if (this.#cooldown !== undefined) {
        clearTimeout(this.#cooldown);
        this.#cooldown = undefined;
      }
    }
  }

  async remove() {
    this.#send();
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
