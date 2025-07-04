import Dom from "../../../dom.js";

declare const L: {
  map: (...args: unknown[]) => { setView: (...args: unknown[]) => unknown };
  tileLayer: (...args: unknown[]) => { addTo: (...args: unknown[]) => unknown };
  control: {
    resetView: (...args: unknown[]) => {
      addTo: (...args: unknown[]) => unknown;
    };
  };
  latLng: (...args: unknown[]) => unknown;
};

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
    this.#send = () => {
      const pos = (
        this.#map as { getCenter: () => { lat: number; lon: number } }
      ).getCenter();
      callback(pos.lat, pos.lon);
    };

    const w = Dom.div(undefined, "mapanswerwrap");

    w.appendChild(
      Dom.p(
        "Move the map so the pin points to your answer, then press Submit.",
      ),
    );

    const mapWrap = Dom.div(undefined, "map");
    mapWrap.id = "map";
    w.appendChild(mapWrap);

    const form = document.createElement("FORM");
    form.classList.add("submitbtn");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.remove();
    });

    this.#submitBtn = Dom.button("Submit", () => {}, "bigbtn");
    form.appendChild(this.#submitBtn);

    w.appendChild(form);

    this.#wrap = Dom.outerwrap();
    this.#wrap.classList.add("answerouterwrap");
    this.#wrap.appendChild(w);

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#map = L.map("map").setView([startLat, startLon], startZoom);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom,
        maxZoom,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.#map);
      L.control
        .resetView({
          position: "topleft",
          title: "Reset Map",
          latlng: L.latLng([startLat, startLon]),
          zoom: startZoom,
        })
        .addTo(this.#map);

      w.style.transform = "translateY(0)";
    });
  }

  async remove() {
    this.#submitBtn.disabled = true;
    this.#submitBtn.blur();
    this.#wrap.style.pointerEvents = "none";
    this.#send();

    setTimeout(this.#fullRemove.bind(this), 100);
  }

  async #fullRemove() {
    return Dom.deleteOuterwrap(this.#wrap);
  }
}
