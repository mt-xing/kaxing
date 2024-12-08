import Home from "./ui/home.js";
import Socket from "../player/socket.js";
import {
  ControllerJoinResponse,
  GameStateBoardResponse,
  JoinRoomPayload,
} from "../payloads.js";
import ControllerJoin from "./ui/controllerJoin.js";
import { Question } from "../question.js";
import UploadQuestions from "./ui/uploadQuestions.js";
import StandardQuestionBoard from "./ui/questions/standard.js";
import Leaderboard from "./ui/leaderboard.js";
import { playGG, startupAudio } from "./audio.js";
import TextUi from "../player/ui/text.js";
import TFQuestionBoard from "./ui/questions/tf.js";

const socket = new Socket("http://localhost:8080/");

function uploadQuestions(): Promise<Question[]> {
  return new Promise((resolve) => {
    new UploadQuestions(document.body, (text) => {
      return new Promise((r) => {
        const questions: Question[] = JSON.parse(text);
        if (!Array.isArray(questions)) {
          r(false);
        }
        r(true);
        resolve(questions);
      });
    });
  });
}

function getGameCode(questions: Question[]): Promise<string> {
  return new Promise((r) => {
    socket.emit("createRoom", JSON.stringify(questions));
    socket.on("createYes", (x) => {
      const { id } = JSON.parse(x) as { id: string };
      socket.off("createYes");
      socket.off("createNo");
      setTimeout(() => {
        r(id);
      }, 500);
    });
    socket.on("createNo", () => {
      // eslint-disable-next-line no-alert
      alert("Error when creating room");
    });
  });
}

function pairController(): Promise<void> {
  return new Promise((resolve) => {
    new ControllerJoin(document.body, (password) => {
      return new Promise((r) => {
        const payload: ControllerJoinResponse = { password };
        socket.on("controllerClaimYes", () => {
          r(true);
          socket.off("controllerClaimYes");
          socket.off("controllerClaimNo");
          resolve();
        });
        socket.on("controllerClaimNo", () => {
          r(false);
          socket.off("controllerClaimYes");
          socket.off("controllerClaimNo");
        });
        socket.emit("controllerClaim", JSON.stringify(payload));
      });
    });
  });
}

function waitForGameToOpen(): Promise<void> {
  return new Promise((resolve) => {
    socket.on("openGame", () => {
      socket.off("openGame");
      resolve();
    });
  });
}

function homeScreen(code: string): Promise<void> {
  return new Promise((r) => {
    const h = new Home(document.body, code);
    socket.on("join", (msg) => {
      const payload = JSON.parse(msg) as JoinRoomPayload;
      h.addPlayer(payload.id, payload.name);
    });
    socket.on("startGame", () => {
      socket.off("join"); // TODO: Join mid-game
      socket.off("startGame");
      h.remove();
      r();
    });
  });
}

function gameScreen(
  questions: Question[],
): Promise<{ name: string; points: number }[]> {
  return new Promise((r) => {
    let ui: { remove: () => Promise<void> } | undefined;
    let questionUi:
      | {
          showAnswers: () => void;
          remove: () => Promise<void>;
          startCountdown: () => void;
          setNumAnswers: (n: number, d: number) => void;
          showResults: (answers: number[], numPlayers: number) => void;
        }
      | undefined;
    let question: Question = questions[0];

    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateBoardResponse;
      switch (payload.t) {
        case "adjustScore":
        case "displayAnswerResults":
        case "showQuestion":
        case "leaderboard":
          break;
        case "setupQ":
          question = questions[payload.n];
        // eslint-disable-next-line no-fallthrough
        case "blank": {
          if (ui) {
            ui.remove();
          }
          ui = undefined;
          break;
        }
        case "showQuestionBoard": {
          switch (question.t) {
            case "standard": {
              if (ui) {
                ui.remove();
              }
              questionUi = new StandardQuestionBoard(
                document.body,
                question,
                payload.numPlayers,
              );
              ui = questionUi;
              break;
            }
            case "tf": {
              ui?.remove();
              questionUi = new TFQuestionBoard(
                document.body,
                question,
                payload.numPlayers,
              );
              ui = questionUi;
              break;
            }
            default:
              break;
          }
          break;
        }
        case "showAnswers":
          questionUi?.showAnswers();
          break;
        case "countdown":
          questionUi?.startCountdown();
          break;
        case "answerReceived":
          questionUi?.setNumAnswers(payload.n, payload.d);
          break;
        case "displayAnswerResultsBoard": {
          switch (question.t) {
            case "standard": {
              const answerCounts = [0, 0, 0, 0];
              payload.answers.forEach((x) => {
                if (x.t !== "standard") {
                  return;
                }
                answerCounts[x.a]++;
              });
              questionUi?.showResults(answerCounts, payload.numPlayers);
              break;
            }
            case "tf": {
              const answerCounts = [0, 0];
              payload.answers.forEach((x) => {
                if (x.t !== "tf") {
                  return;
                }
                answerCounts[x.a ? 0 : 1]++;
              });
              questionUi?.showResults(answerCounts, payload.numPlayers);
              break;
            }
            default:
              break;
          }

          break;
        }
        case "leaderboardBoard":
          if (ui) {
            ui.remove();
          }
          questionUi = undefined;
          setTimeout(() => {
            ui = new Leaderboard(document.body, payload.leaderboard);
          }, 500);
          break;
        case "gg":
          ui?.remove();
          r(payload.leaderboard);
          break;
        default:
          ((x: never) => {
            throw new Error(x);
          })(payload);
      }
    });
  });
}

async function displayResults(leaderboard: { name: string; points: number }[]) {
  if (leaderboard.length < 3) {
    new Leaderboard(
      document.body,
      leaderboard.map((x) => ({ ...x, diff: 0 })),
    );
  } else {
    playGG();

    let ui: TextUi | undefined;
    const showText = (text: string, start: number, end: number) => {
      setTimeout(() => {
        ui = new TextUi(document.body, text);
      }, start);
      setTimeout(() => {
        ui?.remove();
        ui = undefined;
      }, end);
    };

    showText("Results", 0, 3500);
    showText(
      `3rd Place: ${leaderboard[2].name.substring(0, 25)} (${Math.round(leaderboard[2].points)})`,
      4000,
      7500,
    );
    showText(
      `2nd Place: ${leaderboard[1].name.substring(0, 25)} (${Math.round(leaderboard[1].points)})`,
      8000,
      11500,
    );
    showText("Drumroll...", 12000, 13500);
    showText(
      `1st Place: ${leaderboard[0].name.substring(0, 25)} (${Math.round(leaderboard[0].points)})`,
      14000,
      15500,
    );
    setTimeout(() => {
      new Leaderboard(
        document.body,
        leaderboard.map((x) => ({ ...x, diff: 0 })),
      );
    }, 16000);
  }
}

async function gameLoop() {
  const questions = await uploadQuestions();
  const code = await getGameCode(questions);
  await pairController();
  await waitForGameToOpen();
  await homeScreen(code);
  const finalResults = await gameScreen(questions);
  await displayResults(finalResults);
}

window.onload = () => {
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  startupAudio();
  gameLoop();
};
