import Dom from "../../../dom.js";
import { Question, QuestionResults } from "../../../../shared/question.js";
import QuestionBoard from "./base.js";
import ResponseBar from "../responseBar.js";

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

export default class MapQuestionBoard extends QuestionBoard {
  #responseBar: ResponseBar;

  #mapId: string;

  constructor(
    parent: HTMLElement,
    question: Extract<Question, { t: "map" }>,
    numPlayers: number,
  ) {
    const answerContent = Dom.div(
      Dom.p("⬇️ Pin the location on your maps now ⬇️"),
      "instr",
    );
    answerContent.appendChild(
      Dom.p("(Don't forget to click Submit)", "extrainstr"),
    );

    const responseContent = Dom.div();

    super(parent, question, numPlayers, answerContent, responseContent, [
      "miniAnswer",
      "typeResponseWrap",
    ]);

    const map = Dom.div(undefined, "map");
    this.#mapId = `map-${Math.random()}`;
    map.id = this.#mapId;
    responseContent.appendChild(map);

    this.#responseBar = new ResponseBar(responseContent, "5vh");
  }

  protected showAnswersInner(): void {}

  protected showResultsInner(
    results: QuestionResults,
    numPlayers: number,
  ): void {
    if (this.question.t !== "map") {
      console.error("Question mismatch not map", results);
      return;
    }
    if (results.t !== "map") {
      console.error("Results mismatch not map", results);
      return;
    }
    const { numCorrect } = results;
    this.#responseBar.setVal(numCorrect, numPlayers);

    const q = this.question;

    const map = L.map(this.#mapId).setView(
      [q.startLat, q.startLon],
      q.startZoom,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

    const correctCoords = q.correct.representativeAnswers;
    const { wrongCoords } = results;

    correctCoords.forEach((coord) => {
      L.marker(coord, { interactive: false }).addTo(map);
    });

    const rampTime = wrongCoords.length <= 5 ? 2000 : 5000;
    wrongCoords.forEach((coord, i) => {
      setTimeout(
        () => {
          L.marker(coord, {
            interactive: false,
            opacity: 0.45,
            icon: redIcon,
          }).addTo(map);
        },
        2000 + (i * rampTime) / wrongCoords.length,
      );
    });
  }
}
