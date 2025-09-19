import { ControllerJoinResponse } from "../payloads.js";
import ControllerJoin from "./ui/controllerJoin.js";
import UploadQuestions from "./ui/uploadQuestions.js";
import { startupAudio } from "./audio.js";
import { KaXingSaveFile } from "../fileFormat.js";
import mainGameLoop from "./gameFlow/gameBoard.js";
import BoardSocket from "./utils/boardSocket.js";

const socket = new BoardSocket("http://localhost:8080/");

function uploadQuestions(): Promise<KaXingSaveFile> {
  return new Promise((resolve) => {
    new UploadQuestions(document.body, (file) => {
      resolve(file);
    });
  });
}

function getGameCode(questions: KaXingSaveFile): Promise<string> {
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

function pairController(
  questions: KaXingSaveFile,
  code: string,
): Promise<void> {
  return new Promise((resolve) => {
    new ControllerJoin(
      document.body,
      (password) => {
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
      },
      questions,
      code,
    );
  });
}

async function gameLoop() {
  const questions = await uploadQuestions();
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  const code = await getGameCode(questions);
  await pairController(questions, code);
  await mainGameLoop(socket, questions, code, false);
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
