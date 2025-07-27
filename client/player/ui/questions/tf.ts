import Dom from "../../../dom.js";

export default class TFQuestion {
  #wrap: HTMLElement;

  #answerRows: HTMLElement[];

  constructor(parent: HTMLElement, callback: (isTrue: boolean) => void) {
    this.#answerRows = [];

    const w = Dom.div(undefined, "answerRow tfWrap");
    for (let j = 0; j < 2; j++) {
      w.appendChild(
        Dom.button(
          Dom.div(j === 0 ? "T" : "F"),
          () => {
            callback(j === 0);
          },
          `card answer ${j === 0 ? "t" : "f"}`,
        ),
      );
    }
    this.#answerRows.push(w);

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
