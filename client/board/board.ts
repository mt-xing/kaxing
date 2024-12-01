import Home from "./ui/home.js";
// import StandardQuestionBoard from "./ui/questions/standard.js";
// import Leaderboard from "./ui/leaderboard.js";

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

function getGameCode(): Promise<string> {
  return new Promise((r) => {
    socket.emit("createRoom", JSON.stringify([]));
    socket.on("createYes", (x) => {
      const { id } = JSON.parse(x) as { id: string };
      socket.off("createYes");
      socket.off("createNo");
      r(id);
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
    socket.on("start", () => {
      socket.off("join"); // TODO: Join mid-game
      socket.off("start");
      h.remove();
      r();
    });
  });
}

function gameScreen(questions: Question[]): Promise<void> {
  return new Promise(() => {
    let ui: { remove: () => Promise<void> } | undefined;
    let questionUi: StandardQuestionBoard | undefined;
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
        case "leaderboardBoard":
          if (ui) {
            ui.remove();
          }
          questionUi = undefined;
          ui = new Leaderboard(document.body, payload.leaderboard);
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
  const questions = await uploadQuestions();
  const code = await getGameCode();
  await pairController();
  await waitForGameToOpen();
  await homeScreen(code);
  await gameScreen(questions);
}

window.onload = () => {
  gameLoop();
};
