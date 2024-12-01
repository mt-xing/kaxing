import Socket from "../player/socket.js";
import {
  ControllerJoinResponse,
  GameStateControllerResponse,
  JoinRoomPayload,
  KickPlayerPayload,
} from "../../shared/payloads.js";
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

async function waitToJoin(
  code: string,
): Promise<{ players: JoinRoomPayload[] }> {
  return new Promise((r) => {
    const wrap = Dom.div();
    wrap.appendChild(Dom.h2("Welcome"));
    wrap.appendChild(
      Dom.p(
        "Enter the following password for this controller on your game board:",
      ),
    );
    wrap.appendChild(Dom.div(Dom.code(code)));
    document.body.appendChild(wrap);
    socket.on("controllerClaimYes", (msg) => {
      const payload = JSON.parse(msg) as { players: JoinRoomPayload[] };
      socket.off("controllerClaimYes");
      wrap.parentElement?.removeChild(wrap);
      r(payload);
    });
  });
}

async function openGame(): Promise<void> {
  return new Promise((r) => {
    const goBtn = Dom.button(
      "Start",
      () => {
        socket.emit("openGame", "");
        document.body.removeChild(goBtn);
        r();
      },
      "bigbtn",
    );
    document.body.appendChild(goBtn);
  });
}

async function negotiateGameStart(players: { id: string; name: string }[]) {
  return new Promise((r) => {
    const wrap = Dom.div(Dom.h2("Game Setup"));
    const ul = document.createElement("UL");
    const addPlayer = (val: { id: string; name: string }) => {
      const li = document.createElement("LI");
      li.textContent = val.name;
      const btn = Dom.button("Kick", () => {
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm(`Do you really want to kick ${val.name}?`)) {
          ul.removeChild(li);
          const payload: KickPlayerPayload = { id: val.id };
          socket.send("kick", payload);
        }
      });
      li.appendChild(btn);
      ul.appendChild(li);
    };
    players.forEach(addPlayer);
    wrap.appendChild(ul);

    const goBtn = Dom.button("Begin Game", r, "bigbtn");
    wrap.appendChild(goBtn);
    document.body.appendChild(wrap);

    socket.on("join", (msg) => {
      const payload = JSON.parse(msg) as JoinRoomPayload;
      addPlayer(payload);
    });
  });
}

function mainGame(): Promise<void> {
  return new Promise(() => {
    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateControllerResponse;
      switch (payload.t) {
        case "scores":
        case "state":
          break;
        default:
          ((x: never) => {
            throw new Error(x);
          })(payload);
      }
    });
  });
}

async function gameLoop() {
  const code = await getCode();
  const players = await waitToJoin(code);
  await openGame();
  await negotiateGameStart(players.players);
  await mainGame();
}

window.addEventListener("load", () => {
  gameLoop();
});
