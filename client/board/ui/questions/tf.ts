import Dom from "../../../dom.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";

export default class TFQuestionBoard extends QuestionBoard {
  #answers: HTMLElement[];

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "tf" }>,
    numPlayers: number,
  ) {
    const answerContent = Dom.div();
    super(parent, question, numPlayers, answerContent, undefined, ["tfWrap"]);

    const answerRows = [];
    this.#answers = [];

    const w = Dom.div(undefined, "answerRow");
    for (let j = 0; j < 2; j++) {
      const answer = Dom.div(
        Dom.span(j === 0 ? "True" : "False"),
        `card answer ${j === 0 ? "t" : "f"}`,
      );
      w.appendChild(answer);
      this.#answers.push(answer);
    }
    answerRows.push(w);

    answerRows.forEach((x) => answerContent.appendChild(x));
  }

  protected showAnswersInner(): void {
    this.#answers.forEach((a, i) => {
      a.setAttribute("style", `--delay-time: ${(i * 125) / 1000}s`);
      // eslint-disable-next-line no-param-reassign
      a.style.transform = "translateY(0)";
    });
  }

  protected showResultsInner(
    results: QuestionResults,
    numPlayers: number,
  ): void {
    if (this.question.t !== "tf") {
      console.error("Question mismatch not tf", this.question);
      return;
    }
    if (results.t !== "tf") {
      console.error("Results mismatch not tf", results);
      return;
    }
    const q = this.question;

    const checkIfCorrect = (b: boolean) => {
      return q.correct === b;
    };
    this.#answers.forEach((a, i) => {
      const correct = checkIfCorrect(i === 0);
      const numRes = i === 0 ? results.numTrue : results.numFalse;
      a.setAttribute(
        "style",
        `${a.getAttribute("style")}; --correct-percent: ${numRes / numPlayers}; --answer-text: "${numRes}${correct ? " ✅" : ""}"`,
      );
      if (correct) {
        a.classList.add("correct");
      }
      a.classList.add("done");
    });
  }
}
