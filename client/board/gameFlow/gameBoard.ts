import Dom from "../../dom.js";
import { KaXingSaveFile } from "../../fileFormat.js";
import {
  GameStateBoardResponse,
  JoinRoomPayload,
  KickPlayerPayload,
} from "../../payloads.js";
import { Question } from "../../question.js";
import Home from "../ui/home.js";
import Leaderboard from "../ui/leaderboard.js";
import PersistentFooter from "../ui/persistentFooter.js";
import QuestionIntro from "../ui/questionIntro.js";
import QuestionBoard from "../ui/questions/base.js";
import ImgOnly from "../ui/questions/imgOnly.js";
import MapQuestionBoard from "../ui/questions/map.js";
import StandardQuestionBoard from "../ui/questions/standard.js";
import TextQuestionBoard from "../ui/questions/text.js";
import TFQuestionBoard from "../ui/questions/tf.js";
import TypeQuestionBoard from "../ui/questions/type.js";
import { assertUnreachable } from "../utils/assert.js";
import { downloadFile, generateGameSummaryCsv } from "../utils/summary.js";
import displayResults from "./displayFinalResults.js";

type SocketInterface = {
  on: (type: string, cb: (msg: string) => void) => void;
  off: (type: string) => void;
};

function waitForGameToOpen(socket: SocketInterface): Promise<void> {
  return new Promise((resolve) => {
    socket.on("openGame", () => {
      socket.off("openGame");
      resolve();
    });
  });
}

function homeScreen(socket: SocketInterface, code: string): Promise<void> {
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
  socket: SocketInterface,
  gameFile: KaXingSaveFile,
  gameCode: string,
  isSideScreen: boolean,
): Promise<{ name: string; points: number }[]> {
  const { questions } = gameFile;
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
          if (isSideScreen && question.img) {
            ui?.remove();
            questionUi = new ImgOnly(
              document.body,
              question,
              payload.numPlayers,
            );
            ui = questionUi;
            break;
          }
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
          if (!isSideScreen) {
            setTimeout(() => {
              const downloadBtn = Dom.button(
                "Download Results",
                () => {
                  const csv = generateGameSummaryCsv(
                    payload.questionNums,
                    payload.players,
                    gameFile.addlQuestions,
                  );
                  downloadFile("kaxing_game_summary.csv", csv);
                },
                "bigbtn finalDownload",
              );
              Dom.insertEl(downloadBtn, document.body).then(() => {
                downloadBtn.style.opacity = "1";
              });
            }, 20000);
          }
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

export default async function mainGameLoop(
  socket: SocketInterface,
  questions: KaXingSaveFile,
  code: string,
  isSideScreen: boolean,
) {
  await waitForGameToOpen(socket);
  await homeScreen(socket, code);
  const finalResults = await gameScreen(socket, questions, code, isSideScreen);
  await displayResults(finalResults);
}
