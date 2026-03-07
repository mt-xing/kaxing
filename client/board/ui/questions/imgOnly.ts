import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";

export default class ImgOnly extends QuestionBoard {
  constructor(
    parent: HTMLElement,
    question: Question,
    numPlayers: number,
    questionNum: number,
    totalQuestions: number,
  ) {
    const answerContent = Dom.div();
    super(
      parent,
      question,
      numPlayers,
      questionNum,
      totalQuestions,
      answerContent,
      undefined,
      question.t === "text" ? ["imgOnly", "textSlide"] : ["imgOnly"],
    );
  }

  protected showAnswersInner(): void {}

  protected showResultsInner(): void {}
}
