import Dom from "../../dom.js";
import { playTheme, stopAudio } from "../audio.js";

declare const QRCode: any;

export default class Home {
  #wrap: HTMLElement;

  #ul: HTMLElement;

  #playerNames: Map<string, HTMLElement>;

  #numPlayers: HTMLParagraphElement;

  constructor(parent: HTMLElement, gameCode: string) {
    this.#wrap = Dom.div(undefined, "home");

    const instr = Dom.div(undefined, "card instructions");
    instr.appendChild(Dom.h2("Scan to Join"));
    const qrCode = Dom.div();
    qrCode.id = "qrcode";
    instr.appendChild(qrCode);
    instr.appendChild(Dom.p("or visit"));
    const urlWrap = Dom.p("", "code");
    urlWrap.appendChild(Dom.code("mxi.ng/kx"));
    instr.appendChild(urlWrap);
    instr.appendChild(Dom.p("and enter the game code"));
    const codeWrap = Dom.p("", "code");
    codeWrap.appendChild(Dom.code(gameCode));
    instr.appendChild(codeWrap);
    this.#wrap.appendChild(instr);

    const names = Dom.div(Dom.h1("KaXing"), "nameWrap");
    this.#ul = document.createElement("UL");
    names.appendChild(this.#ul);
    this.#playerNames = new Map();
    this.#numPlayers = Dom.p("0 players");
    names.appendChild(this.#numPlayers);
    this.#wrap.appendChild(names);

    playTheme();

    Dom.insertEl(this.#wrap, parent).then(() => {
      this.#wrap.style.transform = "scale(1)translateY(0)";
      new QRCode(
        qrCode,
        `https://michaelxing.com/games/kaxing/client/player?${gameCode}`,
      );
    });
  }

  addPlayer(pID: string, name: string) {
    if (this.#playerNames.has(pID)) {
      console.error("Repeat player ID", pID);
      return;
    }
    const li = document.createElement("LI");
    li.textContent = name;
    this.#ul.prepend(li);
    this.#playerNames.set(pID, li);
    const n = this.#playerNames.size;
    this.#numPlayers.textContent = `${n} player${n === 1 ? "" : "s"}`;
  }

  async remove() {
    stopAudio();
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
