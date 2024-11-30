import Socket from "./socket.js";
import Join from "./ui/join.js";
import { JoinRoomPayload } from "../../shared/payloads.js";

const socket = new Socket("http://localhost:8080/");

function joinGame(): Promise<void> {
  return new Promise((resolve) => {
    new Join(document.body, (id, name) => {
      return new Promise((r) => {
        const payload: JoinRoomPayload = { id, name };
        socket.on("joinYes", () => {
          r(true);
          socket.off("joinYes");
          resolve();
        });
        socket.on("joinNo", () => {
          r(false);
          socket.off("joinNo");
        });
        socket.emit("join", JSON.stringify(payload));
      });
    });
  });
}

async function gameLoop() {
  await joinGame();
}

window.onload = () => {
  gameLoop();
};
