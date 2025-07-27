import Dom from "../../../dom.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";
import ResponseBar from "../responseBar.js";

export default class TypeQuestionBoard extends QuestionBoard {
  #correctResponses: HTMLElement[];

  #responseBar: ResponseBar;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "type" }>,
    numPlayers: number,
  ) {
    const answerContent = Dom.div(Dom.p("⬇️ Type your answer now ⬇️"), "instr");
    answerContent.appendChild(
      Dom.p("(Don't forget to click Submit)", "extrainstr"),
    );

    const responseContent = Dom.div();

    super(parent, question, numPlayers, answerContent, responseContent, [
      "miniAnswer",
      "typeResponseWrap",
    ]);

    this.#responseBar = new ResponseBar(responseContent);

    const correctResponses = question.correct.representativeAnswers;
    this.#correctResponses = correctResponses.map((r) =>
      correctResponses.length === 1 ? Dom.p(r, "response") : Dom.li(r),
    );
    if (correctResponses.length === 1) {
      responseContent.appendChild(this.#correctResponses[0]);
    } else {
      const ul = document.createElement("UL");
      ul.className = "responseList";
      this.#correctResponses.forEach((x) => ul.appendChild(x));
      responseContent.appendChild(ul);
    }
  }

  protected showAnswersInner(): void {}

  protected showResultsInner(
    results: QuestionResults,
    numPlayers: number,
  ): void {
    if (results.t !== "type") {
      console.error("Results mismatch not type", results);
      return;
    }
    const { numCorrect } = results;
    this.#responseBar.setVal(numCorrect, numPlayers);

    setTimeout(() => {
      this.#correctResponses.forEach((x, i) => {
        x.setAttribute("style", `--delay-time: ${i * 100}ms`);
        // eslint-disable-next-line no-param-reassign
        x.style.transform = "translateY(0)";
      });
    }, 100);
  }
}
