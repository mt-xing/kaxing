import Dom from "../../../dom.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import { playEnd, playQuestion, stopAudio } from "../../audio.js";

export default abstract class QuestionBoard {
  #wrap: HTMLElement;

  #countdown: HTMLElement;

  #countdownBar: HTMLElement;

  #countdownTime: HTMLElement;

  #submissionWrap: HTMLElement;

  #submissionBar: HTMLElement;

  #submissionTextNum: HTMLElement;

  #submissionTextDenom: HTMLElement;

  protected question: Question;

  #timeout?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    question: Question,
    numPlayers: number,
    answerUi: HTMLDivElement,
    responseUi?: HTMLDivElement,
    additionalClasses?: string[],
  ) {
    this.question = question;

    this.#wrap = Dom.div(undefined, "questionOuter");
    additionalClasses?.forEach((c) => {
      this.#wrap.classList.add(c);
    });

    this.#countdownBar = Dom.div(undefined, "timeLeft");
    this.#countdownBar.setAttribute("style", `--time: ${question.time + 1}s`);
    this.#countdown = Dom.div(this.#countdownBar, "countdown");
    this.#countdownTime = Dom.p(`${question.time}`);
    this.#countdown.appendChild(this.#countdownTime);
    this.#wrap.appendChild(this.#countdown);

    const questionContent = Dom.div(Dom.p(question.text), "questionContent");
    const questionInner = Dom.div(questionContent, "questionInner");
    this.#wrap.appendChild(questionInner);

    if (question.img !== undefined) {
      const img = document.createElement("IMG") as HTMLImageElement;
      img.src = question.img;
      img.alt = "";
      questionContent.appendChild(Dom.div(img, "imgWrap"));
      this.#wrap.classList.add("hasImg");
    }

    answerUi.classList.add("answerContent");
    questionInner.appendChild(answerUi);

    if (responseUi) {
      responseUi.classList.add("responseContent");
      questionInner.appendChild(responseUi);
    }

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
      this.#wrap.style.transform = "translateY(0)";
    });
  }

  protected abstract showAnswersInner(): void;

  protected abstract showResultsInner(
    results: QuestionResults,
    numPlayers: number,
  ): void;

  showAnswers() {
    this.#wrap.classList.add("showAnswers");
    this.showAnswersInner();
  }

  startCountdown() {
    playQuestion(this.question.time);

    this.#countdown.style.opacity = "1";
    this.#submissionWrap.style.opacity = "1";
    this.#countdownBar.style.transform = "scaleY(1)";

    let timeLeft = this.question.time;
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

  showResults(results: QuestionResults, numPlayers: number) {
    this.endCountdown();
    playEnd();
    this.showResultsInner(results, numPlayers);
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
