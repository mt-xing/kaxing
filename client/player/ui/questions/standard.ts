import Dom from "../../../dom.js";

export default class StandardQuestion {
  #wrap: HTMLElement;

  #answerRows: HTMLElement[];

  constructor(parent: HTMLElement, callback: (answerIndex: number) => void) {
    this.#answerRows = [];

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
        w.appendChild(
          Dom.button(
            Dom.div(getButtonText(i, j)),
            () => {
              callback(i * 2 + j);
            },
            `card answer ${getButtonType(i, j)}`,
          ),
        );
      }
      this.#answerRows.push(w);
    }

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#answerRows.forEach((x) => this.#wrap.appendChild(x));

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
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
