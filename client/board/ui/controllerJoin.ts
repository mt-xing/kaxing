import Dom from "../../dom.js";
import { KaXingSaveFile } from "../../fileFormat.js";
import { spawnWindow } from "../utils/sideDispComm.js";

declare const QRCode: any;

export default class ControllerJoin {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    connect: (pwd: string) => Promise<boolean>,
    questions: KaXingSaveFile,
    code: string,
  ) {
    const wrap = Dom.div(undefined, "controllerWrap");
    wrap.appendChild(Dom.h2("Pair Controller"));
    const instrWrap = Dom.p("Go to ");
    instrWrap.appendChild(Dom.code("michaelxing.com/kaxing"));
    instrWrap.appendChild(
      document.createTextNode(
        ' on your mobile device and choose "Use as Remote Controller" or scan the code below',
      ),
    );
    wrap.appendChild(instrWrap);
    instrWrap.style.maxWidth = "500px";

    const qr = Dom.div(undefined, "controllerQr");
    wrap.appendChild(qr);
    new QRCode(qr, "https://michaelxing.com/games/kaxing/client/control/");

    const form = document.createElement("FORM");
    const input = Dom.input("text", "Password");
    form.appendChild(input);
    const btn = Dom.button(
      "Pair",
      async (e) => {
        e.preventDefault();
        if (input.value.length < 6) {
          return;
        }
        btn.disabled = true;
        const result = await connect(input.value);
        if (result) {
          this.remove();
        } else {
          // eslint-disable-next-line no-alert
          alert("That didn't work");
          btn.disabled = false;
          input.focus();
        }
      },
      "bigbtn",
    );
    form.appendChild(btn);
    wrap.appendChild(form);

    const secondDispWrap = Dom.div(
      Dom.button(
        "Open second display for images",
        () => {
          secondDispWrap.parentElement?.removeChild(secondDispWrap);
          spawnWindow(questions, code);
        },
        "bigbtn",
      ),
      "finalDownload visible",
    );
    wrap.appendChild(secondDispWrap);

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
