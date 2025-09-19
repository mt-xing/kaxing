import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";

export default class ImgOnly extends QuestionBoard {
  constructor(parent: HTMLElement, question: Question, numPlayers: number) {
    const answerContent = Dom.div();
    super(parent, question, numPlayers, answerContent, undefined, ["imgOnly"]);
  }

  protected showAnswersInner(): void {}

  protected showResultsInner(): void {}
}
