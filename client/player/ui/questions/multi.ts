import Dom from "../../../dom.js";

export default class MultiQuestion {
  #wrap: HTMLElement;

  #answerRows: HTMLElement[];

  #answerInputs: HTMLInputElement[];

  #send: () => void;

  #button: HTMLButtonElement;

  constructor(parent: HTMLElement, callback: (answers: number[]) => void) {
    this.#answerRows = [];
    this.#answerInputs = [];

    const getButtonType = (i: number, j: number) => {
      switch (i * 2 + j) {
        case 0:
          return "a";
        case 1:
          return "b";
        case 2:
          return "c";
        case 3:
          return "d";
        default:
          return "";
      }
    };

    const getButtonText = (i: number, j: number) => {
      switch (i * 2 + j) {
        case 0:
          return "Circle Answer";
        case 1:
          return "Triangle Answer";
        case 2:
          return "Square Answer";
        case 3:
          return "Star Answer";
        default:
          return "";
      }
    };

    for (let i = 0; i < 2; i++) {
      const w = Dom.div(undefined, "answerRow");
      for (let j = 0; j < 2; j++) {
        const input = Dom.input("checkbox");
        const id = `multi-element-${i}-${j}-${Math.random()}`;
        input.id = id;
        const label = document.createElement("LABEL");
        label.className = `card answer ${getButtonType(i, j)}`;
        label.setAttribute("for", id);
        label.textContent = getButtonText(i, j);
        label.appendChild(Dom.div());
        w.appendChild(input);
        w.appendChild(label);
        this.#answerInputs.push(input);
      }
      this.#answerRows.push(w);
    }

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.classList.add("multianswer");
    this.#answerRows.forEach((x) => this.#wrap.appendChild(x));

    this.#send = () => {
      const candidates = this.#answerInputs
        .map((x, i) => (x.checked ? i : -1))
        .filter((x) => x !== -1);
      if (candidates.length === 0) {
        console.log("Cannot submit multi-answer with no responses");
        return;
      }
      this.#button.disabled = true;
      this.#button.blur();
      callback(candidates);

      setTimeout(this.#fullRemove.bind(this), 100);
    };
    this.#button = Dom.button("Submit", this.#send.bind(this), "bigbtn");
    this.#wrap.appendChild(this.#button);

    Dom.insertEl(this.#wrap, parent).then(() => {
      (
        Array.from(document.getElementsByClassName("answer")) as HTMLElement[]
      ).forEach((a, i) => {
        a.setAttribute("style", `--delay-time: ${(i * 75) / 1000}s`);
        // eslint-disable-next-line no-param-reassign
        a.style.transform = "scaleY(1)";
      });
    });
  }

  async remove() {
    this.#button.disabled = true;
    this.#button.blur();
    this.#send();
  }

  async #fullRemove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
