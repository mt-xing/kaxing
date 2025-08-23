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
import MapQuestion from "./ui/questions/map.js";
import StandingsUi from "./ui/standings.js";
import FinalUi from "./ui/final.js";

const socket = new Socket("http://localhost:8080/");

/**
 * @returns True if game is already in progress
 */
function joinGame(): Promise<boolean> {
  return new Promise((resolve) => {
    new Join(document.body, (id, name) => {
      return new Promise((r) => {
        const payload: JoinRoomPayload = { id, name };
        socket.on("joinYes", (msg) => {
          r(true);
          socket.off("joinYes");
          socket.off("joinNo");
          resolve(msg === "inProgress");
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

async function gameScreen(inProgress: boolean): Promise<void> {
  let rejoinSkipFirstTaunt = inProgress;
  return new Promise(() => {
    let ui: { remove: () => Promise<void> } | undefined;
    ui = new TextUi(
      document.body,
      inProgress
        ? "Welcome in! You'll rejoin with the next question"
        : "You're in!",
    );
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
          rejoinSkipFirstTaunt = false;
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
                  ui = undefined;
                },
                q.maxChars,
              );
              break;
            }
            case "map": {
              ui?.remove();
              ui = new MapQuestion(
                document.body,
                (lat, lon) => {
                  const a: Answer = {
                    t: "map",
                    a: [lat, lon],
                  };
                  socket.send("response", a);
                  ui = undefined;
                },
                q.startLat,
                q.startLon,
                q.startZoom,
                q.minZoom,
                q.maxZoom,
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
          if (rejoinSkipFirstTaunt) {
            rejoinSkipFirstTaunt = false;
          } else {
            ui = new QuestionResponse(
              document.body,
              payload.correct ?? false,
              getTaunt(payload),
            );
          }
          break;
        }
        case "standing": {
          ui?.remove();
          ui = new StandingsUi(
            document.body,
            payload.points,
            payload.rank,
            payload.numPlayers,
            payload.pointsGained,
            payload.answerTime,
            payload.questionTime,
          );
          break;
        }
        case "final": {
          ui?.remove();
          ui = new FinalUi(
            document.body,
            payload.points,
            payload.rank,
            payload.numPlayers,
            payload.numCorrect,
            payload.numQ,
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
  const inProgress = await joinGame();
  await gameScreen(inProgress);
}

window.onload = () => {
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  socket.on("kick", () => {
    window.onbeforeunload = null;
    // eslint-disable-next-line no-alert
    alert("You have been removed from the game");
    setTimeout(() => {
      window.location.replace("https://mxi.ng/kx");
    }, 100);
  });
  gameLoop();
};
