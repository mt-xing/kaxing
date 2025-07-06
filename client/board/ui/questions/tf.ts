import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import { playEnd, playQuestion, stopAudio } from "../../audio.js";

export default class TFQuestionBoard {
  #wrap: HTMLElement;

  #answers: HTMLElement[];

  #countdown: HTMLElement;

  #countdownBar: HTMLElement;

  #countdownTime: HTMLElement;

  #submissionWrap: HTMLElement;

  #submissionBar: HTMLElement;

  #submissionTextNum: HTMLElement;

  #submissionTextDenom: HTMLElement;

  #question: Extract<Question, { t: "tf" }>;

  #timeout?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "tf" }>,
    numPlayers: number,
  ) {
    this.#question = question;

    this.#wrap = Dom.div(undefined, "questionWrap tfWrap");

    this.#countdownBar = Dom.div(undefined, "timeLeft");
    this.#countdownBar.setAttribute("style", `--time: ${question.time + 1}s`);
    this.#countdown = Dom.div(this.#countdownBar, "countdown");
    this.#countdownTime = Dom.p(`${question.time}`);
    this.#countdown.appendChild(this.#countdownTime);
    this.#wrap.appendChild(this.#countdown);

    this.#wrap.appendChild(Dom.div(Dom.p(question.text), "questionContent"));

    if (question.img !== undefined) {
      const img = document.createElement("IMG") as HTMLImageElement;
      img.src = question.img;
      img.alt = "";
      this.#wrap.appendChild(Dom.div(img, "imgWrap"));
      this.#wrap.classList.add("hasImg");
    }

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

    answerRows.forEach((x) => this.#wrap.appendChild(x));

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
    this.#wrap.classList.add("showingAnswers");
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
    const checkIfCorrect = (b: boolean) => {
      return this.#question.correct === b;
    };
    this.#answers.forEach((a, i) => {
      const correct = checkIfCorrect(i === 0);
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
