import Home from "./ui/home.js";
import Socket from "../player/socket.js";
import {
  ControllerJoinResponse,
  GameStateBoardResponse,
  JoinRoomPayload,
  KickPlayerPayload,
} from "../payloads.js";
import ControllerJoin from "./ui/controllerJoin.js";
import { Question } from "../question.js";
import { KaXingSaveFile } from "../fileFormat.js";
import UploadQuestions from "./ui/uploadQuestions.js";
import StandardQuestionBoard from "./ui/questions/standard.js";
import Leaderboard from "./ui/leaderboard.js";
import { playGG, startupAudio } from "./audio.js";
import TextUi from "../player/ui/text.js";
import TFQuestionBoard from "./ui/questions/tf.js";
import TextQuestionBoard from "./ui/questions/text.js";
import TypeQuestionBoard from "./ui/questions/type.js";
import MapQuestionBoard from "./ui/questions/map.js";
import QuestionBoard from "./ui/questions/base.js";
import PersistentFooter from "./ui/persistentFooter.js";
import QuestionIntro from "./ui/questionIntro.js";
import Dom from "../dom.js";
import { downloadFile, generateGameSummaryCsv } from "./utils/summary.js";
import { assertUnreachable } from "./utils/assert.js";

const socket = new Socket("http://localhost:8080/");

function uploadQuestions(): Promise<Question[]> {
  return new Promise((resolve) => {
    new UploadQuestions(document.body, (text) => {
      return new Promise((r) => {
        const saveFile: KaXingSaveFile = JSON.parse(text);
        const { questions } = saveFile;
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
    socket.on("kick", (msg) => {
      const payload = JSON.parse(msg) as KickPlayerPayload;
      h.kickPlayer(payload.id);
    });
    socket.on("startGame", () => {
      socket.off("join");
      socket.off("startGame");
      socket.off("kick");
      h.remove();
      r();
    });
  });
}

function gameScreen(
  questions: Question[],
  gameCode: string,
): Promise<{ name: string; points: number }[]> {
  const footer = new PersistentFooter(document.body, gameCode);

  return new Promise((r) => {
    let ui: { remove: () => Promise<void> } | undefined;
    let questionUi: QuestionBoard | undefined;
    let question: Question = questions[0];

    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateBoardResponse;
      switch (payload.t) {
        case "adjustScore":
        case "displayAnswerResults":
        case "showQuestion":
        case "leaderboard":
        case "gg":
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
        case "showQuestionIntro": {
          ui?.remove();
          ui = new QuestionIntro(document.body, payload.questionNum, question);
          break;
        }
        case "showQuestionBoard": {
          switch (question.t) {
            case "standard":
            case "multi": {
              ui?.remove();
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
            case "text": {
              ui?.remove();
              questionUi = new TextQuestionBoard(
                document.body,
                question,
                payload.numPlayers,
              );
              ui = questionUi;
              break;
            }
            case "type": {
              ui?.remove();
              questionUi = new TypeQuestionBoard(
                document.body,
                question,
                payload.numPlayers,
              );
              ui = questionUi;
              break;
            }
            case "map": {
              ui?.remove();
              questionUi = new MapQuestionBoard(
                document.body,
                question,
                payload.numPlayers,
              );
              ui = questionUi;
              break;
            }
            default:
              assertUnreachable(question);
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
          questionUi?.showResults(payload.results, payload.numPlayers);
          break;
        }
        case "leaderboardBoard":
          ui?.remove();
          questionUi = undefined;
          setTimeout(() => {
            ui = new Leaderboard(document.body, payload.leaderboard);
          }, 500);
          break;
        case "ggBoard": {
          ui?.remove();
          footer.remove();
          setTimeout(() => {
            const downloadBtn = Dom.button(
              "Download Results",
              () => {
                const csv = generateGameSummaryCsv(
                  payload.questionNums,
                  payload.players,
                );
                downloadFile("kaxing_game_summary.csv", csv);
              },
              "bigbtn finalDownload",
            );
            Dom.insertEl(downloadBtn, document.body).then(() => {
              downloadBtn.style.opacity = "1";
            });
          }, 20000);
          r(payload.leaderboard);
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

async function displayResults(leaderboard: { name: string; points: number }[]) {
  playGG();

  const fixedLeaderboard = [0, 1, 2].map((i) =>
    leaderboard[i] === undefined ? { name: "N/A", points: 0 } : leaderboard[i],
  );

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

  showText("Results", 0, 3000);
  showText(
    `3rd Place: ${fixedLeaderboard[2].name.substring(0, 25)} (${Math.round(fixedLeaderboard[2].points)})`,
    3500,
    7000,
  );
  showText(
    `2nd Place: ${fixedLeaderboard[1].name.substring(0, 25)} (${Math.round(fixedLeaderboard[1].points)})`,
    7500,
    11000,
  );
  showText("Drumroll...", 12000, 13500);
  showText(
    `1st Place: ${fixedLeaderboard[0].name.substring(0, 25)} (${Math.round(fixedLeaderboard[0].points)})`,
    13500,
    15500,
  );
  setTimeout(() => {
    new Leaderboard(
      document.body,
      leaderboard.map((x) => ({ ...x, diff: 0 })),
    );
  }, 16000);
}

async function gameLoop() {
  const questions = await uploadQuestions();
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  const code = await getGameCode(questions);
  await pairController();
  await waitForGameToOpen();
  await homeScreen(code);
  const finalResults = await gameScreen(questions, code);
  await displayResults(finalResults);
}

window.onload = () => {
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  startupAudio();
  gameLoop();
};
