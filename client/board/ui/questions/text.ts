/* eslint-disable @typescript-eslint/no-unused-vars */
import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import { stopAudio } from "../../audio.js";

export default class TextQuestionBoard {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, question: Extract<Question, { t: "text" }>) {
    this.#wrap = Dom.div(undefined, "questionWrap textWrap");

    this.#wrap.appendChild(Dom.div(Dom.p(question.text), "questionContent"));

    if (question.img !== undefined) {
      const img = document.createElement("IMG") as HTMLImageElement;
      img.src = question.img;
      img.alt = "";
      this.#wrap.appendChild(Dom.div(img, "imgWrap"));
      this.#wrap.classList.add("hasImg");
    }

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#wrap.style.transform = "translateY(0)scale(1)";
    });
  }

  showAnswers() {}

  startCountdown() {}

  endCountdown() {}

  setNumAnswers(_numAnswers: number, _numPlayers: number) {}

  showResults(_responses: number[], _numPlayers: number) {}

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
    stopAudio();
  }
}
