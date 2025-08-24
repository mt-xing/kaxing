import Dom from "../../dom.js";
import { Question } from "../../question.js";

function getQuestionType(t: Question["t"]): string {
  switch (t) {
    case "standard":
      return "Multiple Choice";
    case "tf":
      return "True or False";
    case "multi":
      return "Select All That Apply";
    case "type":
      return "Short Answer";
    case "map":
      return "Map Question";
    case "text":
      return "Slide";
    default:
      ((x: never) => {
        throw new Error(x);
      })(t);
  }
}

export default class QuestionIntro {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, questionNum: number, question: Question) {
    const wrap = Dom.div(
      Dom.span(`${questionNum}`, "questionNum"),
      "questionIntro",
    );

    wrap.appendChild(Dom.h2(getQuestionType(question.t)));

    const infoWrap = Dom.div(undefined, "infoWrap");
    wrap.appendChild(infoWrap);

    const timeWrap = Dom.p("");
    timeWrap.appendChild(Dom.span(`${question.time}`));
    timeWrap.appendChild(
      document.createTextNode(` second${question.time !== 1 ? "s" : ""}`),
    );
    infoWrap.appendChild(timeWrap);

    const pointsWrap = Dom.p("");
    pointsWrap.appendChild(Dom.span(`${question.points}`));
    pointsWrap.appendChild(
      document.createTextNode(` point${question.points !== 1 ? "s" : ""}`),
    );
    infoWrap.appendChild(pointsWrap);

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
