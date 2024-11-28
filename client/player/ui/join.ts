import Dom from "../../dom.js";
import StandardQuestion from "./questions/standard.js";

export default class Join {
  #wrap: HTMLElement;

  #codeEl: HTMLInputElement;

  #nameEl: HTMLInputElement;

  constructor(parent: HTMLElement) {
    const wrap = Dom.div(Dom.h1("KaXing"), "card center");
    wrap.appendChild(Dom.p("We have Kahoot at home."));
    const form = document.createElement("form");
    wrap.appendChild(form);

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
          this.remove();
        },
        "bigbtn",
      ),
    );

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
    new StandardQuestion(document.body);
  }
}
