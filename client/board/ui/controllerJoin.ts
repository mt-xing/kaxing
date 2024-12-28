import Dom from "../../dom.js";

export default class ControllerJoin {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, connect: (pwd: string) => Promise<boolean>) {
    const wrap = Dom.div(undefined, "controllerWrap");
    wrap.appendChild(Dom.h2("Pair Controller"));
    wrap.appendChild(
      Dom.p(
        "Join as a controller on another device to use as a remote control",
      ),
    );
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

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
