import Dom from "../../dom.js";

export default class StandingsUi {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    points: number,
    rank: number,
    numPlayers: number,
    pointsGained: number,
    answerTime: number | undefined,
    questionTime: number,
  ) {
    const wrap = Dom.div(undefined, "standings questionRes");

    const rankWrap = Dom.h2("");
    rankWrap.appendChild(Dom.span(`${rank}`));
    rankWrap.appendChild(document.createTextNode(` of ${numPlayers}`));
    wrap.appendChild(rankWrap);

    if (answerTime !== undefined) {
      wrap.appendChild(
        Dom.p(
          `Speed: ${answerTime} second${answerTime !== 1 ? "s" : ""} out of ${questionTime}`,
        ),
      );
      wrap.appendChild(
        Dom.p(`Earned: ${pointsGained} point${pointsGained !== 1 ? "s" : ""}`),
      );
    }
    wrap.appendChild(
      Dom.p(`Total Score: ${points} point${points !== 1 ? "s" : ""}`),
    );

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      setTimeout(() => {
        wrap.style.transform = "translateY(0)";
      }, 500);
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
