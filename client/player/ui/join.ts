import Dom from "../../dom.js";
import StandardQuestion from "./questions/standard.js";

export default class Join {
  #wrap: HTMLElement;

  #codeEl: HTMLInputElement;

  #nameEl: HTMLInputElement;

  constructor(parent: HTMLElement) {
    this.#wrap = Dom.div(Dom.h1("KaXing"), "card center");
    this.#wrap.appendChild(Dom.p("We have Kahoot at home."));
    const form = document.createElement("form");
    this.#wrap.appendChild(form);

    this.#codeEl = Dom.input("text", "Game Code");
    this.#codeEl.maxLength = 5;
    this.#codeEl.required = true;
    form.appendChild(this.#codeEl);

    this.#nameEl = Dom.input("text", "Name");
    this.#nameEl.maxLength = 50;
    this.#nameEl.required = true;
    form.appendChild(this.#nameEl);

    form.appendChild(
      Dom.button(
        "Here We Go",
        (e) => {
          e.preventDefault();
          this.#wrap.parentElement?.removeChild(this.#wrap);
          // eslint-disable-next-line no-new
          new StandardQuestion(document.body);
        },
        "bigbtn",
      ),
    );

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#wrap.style.transform = "translateY(0)";
    });
  }
}
