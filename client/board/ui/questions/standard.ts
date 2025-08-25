import Dom from "../../../dom.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";

export default class StandardQuestionBoard extends QuestionBoard {
  #answers: HTMLElement[];

  constructor(
    parent: HTMLElement,
    question:
      | Extract<Question, { t: "standard" }>
      | Extract<Question, { t: "multi" }>,
    numPlayers: number,
  ) {
    const answerContent = Dom.div();
    super(parent, question, numPlayers, answerContent);

    const answerRows = [];
    this.#answers = [];

    const getButtonType = (i: number, j: number) => {
      switch (i * 2 + j) {
        case 0:
          return "a";
        case 1:
          return "b";
        case 2:
          return "c";
        case 3:
          return "d";
        default:
          return "";
      }
    };

    const getButtonText = (i: number, j: number) => {
      switch (i * 2 + j) {
        case 0:
          return "Circle Answer";
        case 1:
          return "Triangle Answer";
        case 2:
          return "Square Answer";
        case 3:
          return "Star Answer";
        default:
          return "";
      }
    };

    for (let i = 0; i < 2; i++) {
      const w = Dom.div(undefined, "answerRow");
      for (let j = 0; j < 2; j++) {
        const answer = Dom.div(
          Dom.div(getButtonText(i, j)),
          `card answer ${getButtonType(i, j)}`,
        );
        answer.appendChild(Dom.span(question.answers[i * 2 + j]));
        w.appendChild(answer);
        this.#answers.push(answer);
      }
      answerRows.push(w);
    }

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
    if (this.question.t !== "standard" && this.question.t !== "multi") {
      console.error("Question mismatch not standard or multi", this.question);
      return;
    }
    if (results.t !== "standard" && results.t !== "multi") {
      console.error("Results mismatch not standard or multi", results);
      return;
    }
    const q = this.question;

    const checkIfCorrect = (i: number) => {
      const a = q.correct;
      if (typeof a === "number") {
        return i === a;
      } else {
        return a.some((x) => x === i);
      }
    };
    this.#answers.forEach((a, i) => {
      const correct = checkIfCorrect(i);
      a.setAttribute(
        "style",
        `${a.getAttribute("style")}; --correct-percent: ${results.responses[i] / numPlayers}; --answer-text: "${results.responses[i]}${correct ? " ✅" : ""}"`,
      );
      if (correct) {
        a.classList.add("correct");
      }
      a.classList.add("done");
    });
  }
}
