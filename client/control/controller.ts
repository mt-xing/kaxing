import Socket from "../player/socket.js";
import { ControllerJoinResponse } from "../../shared/payloads.js";
import Dom from "../dom.js";

const socket = new Socket("http://localhost:8080/");

async function getCode(): Promise<string> {
  return new Promise((r) => {
    socket.emit("controller", JSON.stringify([]));
    socket.on("controllerYes", (x) => {
      const { password } = JSON.parse(x) as ControllerJoinResponse;
      socket.off("controllerYes");
      socket.off("controllerNo");
      r(password);
    });
    socket.on("controllerNo", () => {
      // eslint-disable-next-line no-alert
      alert("Error when creating room");
    });
  });
}

async function waitToJoin(code: string): Promise<void> {
  return new Promise((r) => {
    const wrap = Dom.div();
    wrap.appendChild(Dom.h2("Waiting"));
    wrap.appendChild(
      Dom.p(
        "Enter the following password for this controller on your game board:",
      ),
    );
    wrap.appendChild(Dom.div(Dom.code(code)));
    document.body.appendChild(wrap);
    socket.on("controllerClaimYes", () => {
      socket.off("controllerClaimYes");
      wrap.parentElement?.removeChild(wrap);
      r();
    });
  });
}

async function gameLoop() {
  const code = await getCode();
  await waitToJoin(code);
}

window.addEventListener("load", () => {
  gameLoop();
});
