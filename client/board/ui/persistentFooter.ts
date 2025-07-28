import Dom from "../../dom.js";

export default class PersistentFooter {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, gameCode: string) {
    const wrap = Dom.div(undefined, "persistentFooter out");

    const p1 = document.createElement("P");
    p1.classList.add("name");
    p1.appendChild(Dom.span("This is "));
    p1.appendChild(Dom.span("KaXing", "logo"));
    wrap.appendChild(p1);

    const p2 = document.createElement("P");
    const joinSpan = Dom.span("Join at ");
    joinSpan.appendChild(Dom.code("mxi.ng/kx"));
    joinSpan.appendChild(document.createTextNode(" with code: "));
    p2.appendChild(joinSpan);
    p2.appendChild(Dom.code(gameCode, "gameCode"));
    wrap.appendChild(p2);

    this.#wrap = wrap;
    Dom.insertEl(this.#wrap, parent).then(() => {
      setTimeout(() => {
        wrap.classList.remove("out");
      }, 1000);
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
