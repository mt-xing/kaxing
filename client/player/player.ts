import Socket from "./socket.js";
import Join from "./ui/join.js";
import {
  GameStateClientResponse,
  JoinRoomPayload,
} from "../../shared/payloads.js";
import TextUi from "./ui/text.js";
import StandardQuestion from "./ui/questions/standard.js";
import { Answer } from "../../shared/question.js";
import QuestionResponse from "./ui/qRes.js";
import { getTaunt } from "./utils/taunts.js";
import TFQuestion from "./ui/questions/tf.js";
import TypeQuestion from "./ui/questions/type.js";

const socket = new Socket("http://localhost:8080/");

function joinGame(): Promise<void> {
  return new Promise((resolve) => {
    new Join(document.body, (id, name) => {
      return new Promise((r) => {
        const payload: JoinRoomPayload = { id, name };
        socket.on("joinYes", () => {
          r(true);
          socket.off("joinYes");
          socket.off("joinNo");
          resolve();
        });
        socket.on("joinNo", () => {
          r(false);
          socket.off("joinYes");
          socket.off("joinNo");
        });
        socket.emit("join", JSON.stringify(payload));
      });
    });
  });
}

async function gameScreen(): Promise<void> {
  return new Promise(() => {
    let ui: { remove: () => Promise<void> } | undefined;
    ui = new TextUi(document.body, "You're in!");
    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateClientResponse;
      switch (payload.t) {
        case "blank": {
          ui?.remove();
          ui = undefined;
          break;
        }
        case "text": {
          ui?.remove();
          ui = new TextUi(document.body, payload.text);
          break;
        }
        case "acceptResponse": {
          const { q } = payload;
          switch (q.t) {
            case "standard": {
              ui?.remove();
              ui = new StandardQuestion(document.body, (i) => {
                const a: Answer = {
                  t: "standard",
                  a: i,
                };
                socket.send("response", a);
                ui?.remove();
              });
              break;
            }
            case "tf": {
              ui?.remove();
              ui = new TFQuestion(document.body, (i) => {
                const a: Answer = {
                  t: "tf",
                  a: i,
                };
                socket.send("response", a);
                ui?.remove();
              });
              break;
            }
            case "type": {
              ui?.remove();
              ui = new TypeQuestion(
                document.body,
                (val) => {
                  const a: Answer = {
                    t: "type",
                    a: val,
                  };
                  socket.send("response", a);
                  ui?.remove();
                },
                q.maxChars,
              );
              break;
            }
            case "multi":
            default:
              break;
          }
          break;
        }
        case "result": {
          ui?.remove();
          ui = new QuestionResponse(
            document.body,
            payload.correct ?? false,
            getTaunt(payload),
          );
          break;
        }
        default:
          ((x: never) => {
            throw new Error(x);
          })(payload);
      }
    });
  });
}

async function gameLoop() {
  await joinGame();
  await gameScreen();
}

window.onload = () => {
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  gameLoop();
};
