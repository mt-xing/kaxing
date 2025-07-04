import Dom from "../../../dom.js";
import { Question } from "../../../../shared/question.js";
import { playEnd, playQuestion, stopAudio } from "../../audio.js";

declare const L: {
  map: (...args: unknown[]) => { setView: (...args: unknown[]) => unknown };
  tileLayer: (...args: unknown[]) => { addTo: (...args: unknown[]) => unknown };
  marker: (...args: unknown[]) => { addTo: (...args: unknown[]) => unknown };
  control: {
    resetView: (...args: unknown[]) => {
      addTo: (...args: unknown[]) => unknown;
    };
  };
  latLng: (...args: unknown[]) => unknown;
  Icon: new (...args: unknown[]) => unknown;
};

export default class MapQuestionBoard {
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

  #mapId: string;

  #question: Extract<Question, { t: "map" }>;

  #timeout?: ReturnType<typeof setTimeout>;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "map" }>,
    numPlayers: number,
  ) {
    this.#question = question;

    this.#wrap = Dom.div(undefined, "questionWrap tfWrap mapWrap");

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
      Dom.p("⬇️ Pin the location on your maps now ⬇️"),
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
    const map = Dom.div(undefined, "map");
    this.#mapId = `map-${Math.random()}`;
    map.id = this.#mapId;
    this.#responseWrap.appendChild(map);
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

  showResultsMap(
    numCorrect: number,
    numPlayers: number,
    wrongCoords: [number, number][],
  ) {
    const correctCoords = this.#question.correct.representativeAnswers;

    this.endCountdown();
    playEnd();
    this.#instrWrap.style.opacity = "0";

    this.#responseText.textContent = `${numCorrect} / ${numPlayers}`;

    const q = this.#question;

    const map = L.map(this.#mapId).setView(
      [q.startLat, q.startLon],
      q.startZoom,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      // minZoom: q.minZoom,
      // maxZoom: q.maxZoom,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.control
      .resetView({
        position: "topleft",
        title: "Reset Map",
        latlng: L.latLng([q.startLat, q.startLon]),
        zoom: q.startZoom,
      })
      .addTo(map);

    const redIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    correctCoords.forEach((coord) => {
      L.marker(coord, { interactive: false }).addTo(map);
    });
    wrongCoords.forEach((coord) => {
      L.marker(coord, {
        interactive: false,
        opacity: 0.45,
        icon: redIcon,
      }).addTo(map);
    });

    setTimeout(() => {
      this.#responseBar.style.transform = `scaleX(${numCorrect / numPlayers})`;
      this.#responseWrap.classList.add("show");
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
