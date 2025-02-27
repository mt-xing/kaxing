import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import { playEnd, playQuestion, stopAudio } from "../../audio.js";

export default class TypeQuestionBoard {
  #wrap: HTMLElement;

  #instrWrap: HTMLElement;

  #responseWrap: HTMLElement;

  #responseBar: HTMLElement;

  #responseText: HTMLElement;

  #countdown: HTMLElement;

  #countdownBar: HTMLElement;

  #countdownTime: HTMLElement;

  #submissionWrap: HTMLElement;

  #submissionBar: HTMLElement;

  #submissionTextNum: HTMLElement;

  #submissionTextDenom: HTMLElement;

  #question: Extract<Question, { t: "type" }>;

  #timeout?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "type" }>,
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

    this.#instrWrap = Dom.div(
      Dom.p("⬇️ Type your answer now ⬇️"),
      "answerwrap instr",
    );
    this.#instrWrap.appendChild(
      Dom.p("(Don't forget to click Submit)", "extrainstr"),
    );
    this.#wrap.appendChild(this.#instrWrap);

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

    this.#responseWrap = Dom.div(undefined, "typeResponseWrap");
    this.#wrap.appendChild(this.#responseWrap);
    const responseBarOuter = Dom.div(undefined, "responseBar");
    this.#responseBar = Dom.div(undefined, "responseBarInner");
    this.#responseText = Dom.p("", "responseText");
    responseBarOuter.appendChild(this.#responseBar);
    responseBarOuter.appendChild(this.#responseText);
    this.#responseWrap.appendChild(responseBarOuter);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#wrap.style.transform = "translateY(20vh)scale(1)";
    });
  }

  showAnswers() {
    this.#wrap.classList.add("smooth");
    this.#wrap.classList.add("showingAnswers");
    this.#wrap.style.transform = "translateY(0)";
    this.#instrWrap.style.transform = "translateY(0)";
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

  showResultsType(answers: string[], numPlayers: number) {
    const correctResponses = this.#question.correct.representativeAnswers;
    const regex = new RegExp(this.#question.correct.regex, "i");

    const numCorrect = answers.reduce(
      (a, x) => a + (regex.test(x.trim()) ? 1 : 0),
      0,
    );

    this.endCountdown();
    playEnd();
    this.#instrWrap.style.opacity = "0";

    const responses = correctResponses.map((r) =>
      correctResponses.length === 1 ? Dom.p(r, "response") : Dom.li(r),
    );

    if (correctResponses.length === 1) {
      this.#responseWrap.appendChild(responses[0]);
    } else {
      const ul = document.createElement("UL");
      ul.className = "responseList";
      responses.forEach((x) => ul.appendChild(x));
      this.#responseWrap.appendChild(ul);
    }

    this.#responseText.textContent = `${numCorrect} / ${numPlayers}`;

    setTimeout(() => {
      this.#responseBar.style.transform = `scaleX(${numCorrect / numPlayers})`;
      this.#responseWrap.classList.add("show");

      responses.forEach((x, i) => {
        x.setAttribute("style", `--delay-time: ${i * 100}ms`);
        // eslint-disable-next-line no-param-reassign
        x.style.transform = "translateY(0)";
      });
    }, 500);
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
