import Dom from "../../dom.js";

export default class FinalUi {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    points: number,
    rank: number,
    numPlayers: number,
    numCorrect: number,
    numQ: number,
  ) {
    const wrap = Dom.div(undefined, "standings questionRes");

    const rankWrap = Dom.h2("");
    rankWrap.appendChild(Dom.span(`${rank}`));
    rankWrap.appendChild(document.createTextNode(` of ${numPlayers}`));
    wrap.appendChild(rankWrap);

    wrap.appendChild(
      Dom.p(`Final Score: ${points} point${points !== 1 ? "s" : ""}`),
    );
    wrap.appendChild(
      Dom.p(
        `Correctly answered ${numCorrect} question${numCorrect !== 1 ? "s" : ""} of ${numQ}`,
      ),
    );

    const brandingP = Dom.p("Create your own at ");
    const link = document.createElement("A");
    link.textContent = "michaelxing.com/kaxing";
    link.setAttribute("href", "https://michaelxing.com/kaxing");
    link.setAttribute("target", "_blank");
    brandingP.appendChild(link);
    wrap.appendChild(brandingP);

    wrap.appendChild(Dom.p("Thank you for playing!", "final"));

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
