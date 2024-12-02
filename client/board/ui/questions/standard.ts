import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import { playEnd, playQuestion, stopAudio } from "../../audio.js";

export default class StandardQuestionBoard {
  #wrap: HTMLElement;

  #answers: HTMLElement[];

  #countdown: HTMLElement;

  #countdownBar: HTMLElement;

  #countdownTime: HTMLElement;

  #submissionWrap: HTMLElement;

  #submissionBar: HTMLElement;

  #submissionTextNum: HTMLElement;

  #submissionTextDenom: HTMLElement;

  #question: Extract<Question, { t: "standard" }>;

  #timeout?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "standard" }>,
    numPlayers: number,
  ) {
    this.#question = question;

    this.#wrap = Dom.div(undefined, "questionWrap");

    this.#countdownBar = Dom.div(undefined, "timeLeft");
    this.#countdownBar.setAttribute("style", `--time: ${question.time + 1}s`);
    this.#countdown = Dom.div(this.#countdownBar, "countdown");
    this.#countdownTime = Dom.p(`${question.time}`);
    this.#countdown.appendChild(this.#countdownTime);
    this.#wrap.appendChild(this.#countdown);

    this.#wrap.appendChild(Dom.div(Dom.p(question.text), "questionContent"));

    const answerWraps = [];
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
      const w = Dom.div(undefined, "answerwrap");
      for (let j = 0; j < 2; j++) {
        const answer = Dom.div(
          Dom.div(getButtonText(i, j)),
          `card answer ${getButtonType(i, j)}`,
        );
        answer.appendChild(Dom.span(question.answers[i * 2 + j]));
        w.appendChild(answer);
        this.#answers.push(answer);
      }
      answerWraps.push(w);
    }

    answerWraps.forEach((x) => this.#wrap.appendChild(x));

    this.#submissionBar = Dom.div(undefined, "numSubmissions");
    this.#submissionWrap = Dom.div(this.#submissionBar, "submissions");
    const subTimeWrap = document.createElement("P");
    this.#submissionTextNum = Dom.span("0");
    const sep = Dom.span("of", "sep");
    this.#submissionTextDenom = Dom.span(`${numPlayers}`);
    subTimeWrap.appendChild(this.#submissionTextNum);
    subTimeWrap.appendChild(sep);
    subTimeWrap.appendChild(this.#submissionTextDenom);
    this.#submissionWrap.appendChild(subTimeWrap);
    this.#wrap.appendChild(this.#submissionWrap);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#wrap.style.transform = "translateY(20vh)scale(1)";
    });
  }

  showAnswers() {
    this.#wrap.classList.add("smooth");
    this.#wrap.style.transform = "translateY(0)";
    this.#answers.forEach((a, i) => {
      a.setAttribute("style", `--delay-time: ${(i * 125) / 1000}s`);
      // eslint-disable-next-line no-param-reassign
      a.style.transform = "translateY(0)";
    });
  }

  startCountdown() {
    playQuestion(this.#question.time);

    this.#countdown.style.opacity = "1";
    this.#submissionWrap.style.opacity = "1";
    this.#countdownBar.style.transform = "scaleY(1)";

    let timeLeft = this.#question.time;
    const adjustTime = () => {
      timeLeft--;
      this.#countdownTime.textContent = `${timeLeft}`;
      if (timeLeft > 0) {
        this.#timeout = setTimeout(adjustTime, 1000);
      }
    };
    this.#timeout = setTimeout(adjustTime, 1500);
  }

  endCountdown() {
    stopAudio();
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }
    this.#countdownTime.textContent = "";
    this.#countdownBar.style.transition = "none";
    this.#countdownBar.style.transform = "scaleY(1)";
  }

  setNumAnswers(numAnswers: number, numPlayers: number) {
    this.#submissionTextNum.textContent = `${numAnswers}`;
    this.#submissionTextDenom.textContent = `${numPlayers}`;
    this.#submissionBar.style.transform = `scaleY(${numAnswers / numPlayers})`;
  }

  showResults(responses: number[], numPlayers: number) {
    this.endCountdown();
    playEnd();
    const checkIfCorrect = (i: number) => {
      const a = this.#question.correct;
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
        `${a.getAttribute("style")}; --correct-percent: ${responses[i] / numPlayers}; --answer-text: "${responses[i]}${correct ? " ✅" : ""}"`,
      );
      if (correct) {
        a.classList.add("correct");
      }
      a.classList.add("done");
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
    stopAudio();

    this.#countdown.style.opacity = "0";
    this.#submissionWrap.style.opacity = "0";
    setTimeout(() => {
      this.#countdown.parentElement?.removeChild(this.#countdown);
      this.#submissionWrap.parentElement?.removeChild(this.#submissionWrap);
    }, 1000);
  }
}
