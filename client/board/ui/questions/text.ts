/* eslint-disable @typescript-eslint/no-unused-vars */
import Dom from "../../../dom.js";
import { stopAudio } from "../../audio.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";

export default class TextQuestionBoard extends QuestionBoard {
  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "text" }>,
    numPlayers: number,
  ) {
    super(parent, question, numPlayers, Dom.div());
  }

  showAnswers() {}

  startCountdown() {}

  endCountdown() {}

  setNumAnswers(_numAnswers: number, _numPlayers: number) {}

  showResults(_results: QuestionResults, _numPlayers: number) {}

  protected showAnswersInner(): void {}

  protected showResultsInner(
    _results: QuestionResults,
    _numPlayers: number,
  ): void {}
}
