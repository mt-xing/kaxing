import Dom from "../../dom.js";

export default class FinalResultsUi {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    place: number,
    name: string,
    points: number,
  ) {
    const wrap = Dom.div(undefined, "questionRes finalResult");
    wrap.appendChild(Dom.span(`${place}`, "rankNum"));
    wrap.appendChild(Dom.h2(name));
    wrap.appendChild(Dom.p(`${points} point${points !== 1 ? "s" : ""}`));

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      window.setTimeout(() => {
        wrap.style.transform = "translateY(0)";
      }, 500);
    });
  }

  showName() {
    this.#wrap.classList.add("showName");
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
