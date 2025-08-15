import Socket from "../player/socket.js";
import {
  ControllerJoinResponse,
  ControllerSuccessResponse,
  GameStateControllerResponse,
  GameStatePayload,
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

async function waitToJoin(code: string): Promise<ControllerSuccessResponse> {
  return new Promise((r) => {
    const wrap = Dom.div(undefined, "setup infoScreen");
    wrap.appendChild(Dom.h1("KaXing"));
    wrap.appendChild(Dom.h2("Remote Controller"));
    wrap.appendChild(
      Dom.p(
        "Enter the following password for this controller on your game board:",
      ),
    );
    wrap.appendChild(Dom.div(Dom.code(code)));
    document.body.appendChild(wrap);
    socket.on("controllerClaimYes", (msg) => {
      const payload = JSON.parse(msg) as ControllerSuccessResponse;
      socket.off("controllerClaimYes");
      wrap.parentElement?.removeChild(wrap);
      r(payload);
    });
  });
}

async function openGame(gameCode: string): Promise<void> {
  return new Promise((r) => {
    const goBtn = Dom.div(Dom.h2("Waiting to Start"), "infoScreen");
    goBtn.appendChild(Dom.p("Click Start to allow players to join the game."));
    const codeWrap = Dom.p("The game code will be: ");
    codeWrap.appendChild(Dom.code(gameCode));
    goBtn.appendChild(codeWrap);
    goBtn.appendChild(
      Dom.button(
        "Start",
        () => {
          socket.emit("openGame", "");
          document.body.removeChild(goBtn);
          r();
        },
        "bigbtn",
      ),
    );
    document.body.appendChild(goBtn);
  });
}

async function negotiateGameStart(
  gameCode: string,
  players: { id: string; name: string }[],
): Promise<void> {
  return new Promise((r) => {
    const wrap = Dom.div(Dom.h2("Players Joining"), "playerJoin infoScreen");
    const codeWrap = Dom.p("Game code: ");
    codeWrap.appendChild(Dom.code(gameCode));
    wrap.appendChild(codeWrap);

    const table = document.createElement("TABLE");
    table.classList.add("playerList");
    const headerRow = document.createElement("TR");
    const headerSpacer = document.createElement("TH");
    headerSpacer.innerHTML = "&nbsp;";
    headerRow.appendChild(headerSpacer);
    const headerText = document.createElement("TH");
    headerText.setAttribute("width", "99%");
    headerText.textContent = "Players";
    headerRow.appendChild(headerText);
    table.appendChild(headerRow);

    const emptyRow = document.createElement("TR");
    emptyRow.appendChild(document.createElement("TD"));
    const emptyText = document.createElement("TD");
    emptyText.textContent = "No one here yet";
    emptyRow.appendChild(emptyText);
    table.appendChild(emptyRow);
    let empty = true;

    const addPlayer = (val: { id: string; name: string }) => {
      const tr = document.createElement("TR");
      const kickWrap = document.createElement("TD");

      const btn = Dom.button("X", () => {
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm(`Do you really want to kick ${val.name}?`)) {
          table.removeChild(tr);
          const payload: KickPlayerPayload = { id: val.id };
          socket.send("kick", payload);
        }
      });
      kickWrap.appendChild(btn);
      tr.appendChild(kickWrap);

      const nameWrap = document.createElement("TD");
      nameWrap.textContent = val.name;
      tr.appendChild(nameWrap);
      table.appendChild(tr);

      if (empty) {
        empty = false;
        table.removeChild(emptyRow);
      }
    };

    players.forEach(addPlayer);
    wrap.appendChild(table);

    const goBtn = Dom.button(
      "Begin Game",
      () => {
        socket.emit("startGame", "");
        document.body.removeChild(wrap);
        r();
      },
      "bigbtn",
    );
    wrap.appendChild(goBtn);
    document.body.appendChild(wrap);

    socket.on("join", (msg) => {
      const payload = JSON.parse(msg) as JoinRoomPayload;
      addPlayer(payload);
    });
  });
}

async function mainGame(numQuestions: number): Promise<void> {
  await new Promise((r) => {
    setTimeout(r, 1000);
  });
  return new Promise(() => {
    let qID = 0;

    const send = (msg: GameStatePayload) => {
      socket.send("gameState", msg);
    };
    send({
      t: "setupQ",
      n: 0,
    });

    const wrap = Dom.div(Dom.h2("Game Control"));
    const qIdUi = Dom.p(`Question ${qID}`);
    wrap.appendChild(qIdUi);
    const prevQBtn = Dom.button("Previous Question", () => {
      if (qID <= 0) {
        return;
      }
      qID--;
      send({
        t: "setupQ",
        n: qID,
      });
    });
    const nextQBtn = Dom.button("Next Question", () => {
      if (qID >= numQuestions - 1) {
        return;
      }
      qID++;
      send({
        t: "setupQ",
        n: qID,
      });
    });
    wrap.appendChild(prevQBtn);
    wrap.appendChild(nextQBtn);
    const endGameBtn = Dom.button("END GAME (DANGER)", () => {
      // eslint-disable-next-line no-restricted-globals, no-alert
      if (!confirm("DO YOU REALLY WANT TO END THE GAME?")) {
        return;
      }
      send({ t: "blank" });
      setTimeout(() => {
        send({ t: "gg" });
      }, 1000);
    });
    wrap.appendChild(endGameBtn);

    const questionInfo = document.createElement("PRE");
    questionInfo.classList.add("questionPreview");
    wrap.appendChild(questionInfo);

    wrap.appendChild(Dom.h2("Question Progression"));

    const blankBtn = Dom.button(
      "Blank",
      () => {
        send({ t: "blank" });
      },
      "bigbtn",
    );
    const showQBtn = Dom.button(
      "Show Question",
      () => {
        send({ t: "showQuestion" });
      },
      "bigbtn",
    );
    const showABtn = Dom.button(
      "Show Answers",
      () => {
        send({ t: "showAnswers" });
      },
      "bigbtn",
    );
    const countdownBtn = Dom.button(
      "Start Countdown",
      () => {
        send({ t: "countdown" });
      },
      "bigbtn",
    );
    const resultsBtn = Dom.button(
      "Skip to Results",
      () => {
        send({ t: "displayAnswerResults" });
      },
      "bigbtn",
    );
    const leaderboardBtn = Dom.button(
      "Show Leaderboard",
      () => {
        send({ t: "leaderboard" });
      },
      "bigbtn",
    );

    wrap.appendChild(Dom.div(blankBtn));
    wrap.appendChild(Dom.div(showQBtn));
    wrap.appendChild(Dom.div(showABtn));
    wrap.appendChild(Dom.div(countdownBtn));
    wrap.appendChild(Dom.div(resultsBtn));
    wrap.appendChild(Dom.div(leaderboardBtn));

    blankBtn.disabled = true;
    showABtn.disabled = true;
    countdownBtn.disabled = true;
    resultsBtn.disabled = true;

    document.body.appendChild(wrap);

    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateControllerResponse;
      switch (payload.t) {
        case "scores":
          break;
        case "state": {
          qID = payload.question;
          qIdUi.textContent = `Question ${qID}`;
          questionInfo.textContent = payload.questionString;
          switch (payload.state) {
            case "blank": {
              blankBtn.disabled = true;
              showQBtn.disabled = false;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              break;
            }
            case "question": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = false;
              countdownBtn.disabled = false;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              break;
            }
            case "answers": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = false;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              break;
            }
            case "countdown": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = false;
              leaderboardBtn.disabled = false;
              break;
            }
            case "results": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              break;
            }
            case "leaderboard": {
              blankBtn.disabled = false;
              showQBtn.disabled = false;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = true;
              break;
            }
            default:
              ((x: never) => {
                throw new Error(x);
              })(payload.state);
          }
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
  const code = await getCode();
  const gameData = await waitToJoin(code);
  await openGame(gameData.gameCode);
  await negotiateGameStart(gameData.gameCode, gameData.players);
  await mainGame(gameData.numQuestions);
}

window.addEventListener("load", () => {
  window.onbeforeunload = () => "Are you sure you want to leave the game?";
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  gameLoop();
});
