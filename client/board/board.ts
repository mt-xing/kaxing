import Home from "./ui/home.js";
// import StandardQuestionBoard from "./ui/questions/standard.js";
// import Leaderboard from "./ui/leaderboard.js";

import Socket from "../player/socket.js";
import { JoinRoomPayload } from "../payloads.js";

const socket = new Socket("http://localhost:8080/");

function getGameCode(): Promise<string> {
  return new Promise((r) => {
    socket.emit("createRoom", JSON.stringify([]));
    socket.on("createYes", (x) => {
      const { id } = JSON.parse(x) as { id: string };
      socket.off("createYes");
      r(id);
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
  });
}

async function gameLoop() {
  const code = await getGameCode();
  await homeScreen(code);
}

window.onload = () => {
  gameLoop();
  // new Home(document.body, "fjiw8");
  // @ts-ignore
  // window.testBoard = new StandardQuestionBoard(
  //   document.body,
  //   {
  //     t: "standard",
  //     points: 100,
  //     time: 20,
  //     text: "Which of the following members of course staff did not lead at least one lab or discussion this semester?",
  //     correct: 3,
  //     answers: ["James Zhang", "Sean Zhang", "Jonathan Gabor", "Jonah Huang"],
  //   },
  //   50,
  // );
  // new Leaderboard(document.body, [
  //   { name: "Michael Xing", points: 4958, diff: 1 },
  //   { name: "Sean Zhang (cheating)", points: 4008, diff: 1 },
  //   { name: "David Lin (super cheating)", points: 3958, diff: 0 },
  //   { name: "Someone Else", points: 3558, diff: -2 },
  //   {
  //     name: "Etc. really long name test eowjfoiwjf4e3890i3  938t 983 9ghr3owiefjwl 2wfewhfkwe w foi ewjiosdfsf fejwoifjwoifjeoiwejfoiw",
  //     points: 2000,
  //     diff: 2,
  //   },
  // ]);
};
