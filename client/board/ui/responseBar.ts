import Dom from "../../dom.js";

export default class ResponseBar {
  #bar: HTMLDivElement;

  #text: HTMLParagraphElement;

  constructor(
    parent: HTMLElement,
    customHeight?: string,
    customClassName?: string,
  ) {
    const responseBarOuter = Dom.div(undefined, "responseBar");
    if (customClassName) {
      responseBarOuter.classList.add(customClassName);
    }
    if (customHeight) {
      responseBarOuter.style.height = customHeight;
    }
    this.#bar = Dom.div(undefined, "responseBarInner");
    this.#text = Dom.p("", "responseText");
    responseBarOuter.appendChild(this.#bar);
    responseBarOuter.appendChild(this.#text);
    parent.appendChild(responseBarOuter);
  }

  setVal(num: number, den: number) {
    this.#text.textContent = `${num} / ${den}`;
    setTimeout(() => {
      this.#bar.style.transform = `scaleX(${num / den})`;
    }, 500);
  }
}
