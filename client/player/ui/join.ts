import Dom from "../../dom.js";
import StandardQuestion from "./questions/standard.js";

export default class Join {
  #wrap: HTMLElement;

  #message: HTMLElement;

  #codeEl: HTMLInputElement;

  #nameEl: HTMLInputElement;

  constructor(
    parent: HTMLElement,
    connect: (id: string, name: string) => Promise<boolean>,
  ) {
    const wrap = Dom.div(Dom.h1("KaXing"), "card center");
    this.#message = Dom.p("We have Kahoot at home.");
    wrap.appendChild(this.#message);
    const form = document.createElement("form");
    wrap.appendChild(form);

    this.#codeEl = Dom.input("text", "Game Code");
    this.#codeEl.maxLength = 5;
    this.#codeEl.required = true;
    this.#codeEl.style.fontFamily = "'Consolas', monospace";
    form.appendChild(this.#codeEl);

    if (window.location.search.length === 6) {
      this.#codeEl.value = window.location.search.substring(1);
      this.#codeEl.style.display = "none";
    }

    this.#nameEl = Dom.input("text", "Name");
    this.#nameEl.maxLength = 50;
    this.#nameEl.required = true;
    form.appendChild(this.#nameEl);

    const goBtn = Dom.button(
      "Here We Go",
      async (e) => {
        e.preventDefault();
        if (!this.#nameEl.value || this.#codeEl.value.length < 5) {
          return;
        }
        goBtn.disabled = true;
        const result = await connect(this.#codeEl.value, this.#nameEl.value);
        if (result) {
          this.remove();
        } else {
          this.#message.textContent = "That didn't work. Try again?";
          this.#message.classList.add("error");
          this.#codeEl.style.display = "";
          goBtn.disabled = false;
          this.#codeEl.focus();
        }
      },
      "bigbtn",
    );

    form.appendChild(goBtn);

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
