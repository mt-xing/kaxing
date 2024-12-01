import Dom from "../../dom.js";

export default class Leaderboard {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    data: { name: string; points: number; diff: number }[],
  ) {
    const wrap = Dom.div(Dom.h2("Leaderboard"), "leaderboard");

    const ol = document.createElement("OL");
    const list: HTMLElement[] = [];

    for (let i = 0; i < Math.min(5, data.length); i++) {
      const x = data[i];
      const li = Dom.li(Dom.span(x.name));
      const s2 = document.createElement("SPAN");
      if (x.diff !== 0) {
        const s3 = Dom.span(x.diff > 0 ? "▲" : "▼", x.diff > 0 ? "up" : "down");
        s2.appendChild(s3);
        s2.appendChild(
          document.createTextNode(
            `${Math.abs(x.diff)}: ${Math.round(x.points)}`,
          ),
        );
      } else {
        s2.appendChild(document.createTextNode(`${Math.round(x.points)}`));
      }
      li.appendChild(s2);
      ol.appendChild(li);
      list.push(li);
    }

    wrap.appendChild(ol);

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
      list.forEach((a, i) => {
        a.setAttribute("style", `--delay-time: ${(i * 125) / 1000}s`);
        // eslint-disable-next-line no-param-reassign
        a.style.transform = "translateY(0)";
      });
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
