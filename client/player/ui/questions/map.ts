import Dom from "../../../dom.js";

export default class MapQuestion {
  #wrap: HTMLElement;

  #map: unknown;

  #submitBtn: HTMLButtonElement;

  #send: () => void;

  constructor(
    parent: HTMLElement,
    callback: (lat: number, lon: number) => void,
    startLat: number,
    startLon: number,
    startZoom: number,
    minZoom: number,
    maxZoom: number,
  ) {
    // this.#send = () => callback(this.#input.value);

    const w = Dom.div(undefined, "mapanswerwrap");

    /*
    <div class="mapanswerwrap">
                <p class="toptext">
                    Move the map so the pin is on your answer, then press Submit.
                    <button class="bigbtn smallbtn">Reset Map</button>
                </p>
                <div id="map" class="map"></div>
                <p class="submitbtn"><button class="bigbtn">Submit</button></p>
            </div>
    */

    const instr = Dom.p(
      "Move the map so the pin is on your answer, then press Submit. ",
      "toptext",
    );
    const resetBtn = Dom.button("Reset Map", () => {}, "bigbtn smallbtn");
    instr.appendChild(resetBtn);
    w.appendChild(instr);

    const mapWrap = Dom.div(undefined, "map");
    mapWrap.id = "map";
    w.appendChild(mapWrap);

    const form = document.createElement("FORM");
    form.classList.add("submitbtn");
    // TODO below here
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.#input.value.length > 0) {
        this.remove();
      }
    });

    this.#input = Dom.input(
      "text",
      "<Insert Stunning Insight Here>",
      undefined,
      "card",
    );
    this.#input.setAttribute("autocomplete", "off");
    this.#input.setAttribute("autocapitalize", "off");
    this.#input.setAttribute("spellcheck", "false");
    this.#input.setAttribute("autocorrect", "off");
    this.#input.maxLength = maxLength;
    form.appendChild(this.#input);

    this.#button = Dom.button("Submit", () => {}, "bigbtn");
    form.appendChild(this.#button);

    w.appendChild(form);

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.appendChild(w);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#input.style.transform = "scaleX(1)";
      this.#button.style.opacity = "1";
      instr.style.opacity = "1";
    });
  }

  async remove() {
    this.#input.disabled = true;
    this.#button.disabled = true;
    this.#button.blur();
    if (this.#input.value.length > 0) {
      this.#send();
    }

    setTimeout(this.#fullRemove.bind(this), 100);
  }

  async #fullRemove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
