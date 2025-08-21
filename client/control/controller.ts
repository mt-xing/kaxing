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
import { Question } from "../question.js";

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
    const headerText = document.createElement("TH");
    headerText.setAttribute("colspan", "2");
    headerText.textContent = "Players";
    headerRow.appendChild(headerText);
    table.appendChild(headerRow);

    let emptyRow = document.createElement("TR");
    const spacer = document.createElement("TD");
    spacer.textContent = "-";
    emptyRow.appendChild(spacer);
    const emptyText = document.createElement("TD");
    emptyText.textContent = "No one here yet";
    emptyRow.appendChild(emptyText);
    table.appendChild(emptyRow);
    let empty = true;
    let numPlayers = 0;

    const addPlayer = (val: { id: string; name: string }) => {
      const tr = document.createElement("TR");
      const kickWrap = document.createElement("TD");
      numPlayers++;

      const btn = Dom.button("X", () => {
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm(`Do you really want to kick ${val.name}?`)) {
          table.removeChild(tr);
          const payload: KickPlayerPayload = { id: val.id };
          socket.send("kick", payload);
          numPlayers--;
          if (numPlayers <= 0) {
            emptyRow = document.createElement("TR");
            const spacer2 = document.createElement("TD");
            spacer2.textContent = "-";
            emptyRow.appendChild(spacer2);
            const emptyText2 = document.createElement("TD");
            emptyText2.textContent = "No one here yet";
            emptyRow.appendChild(emptyText2);
            table.appendChild(emptyRow);
            empty = true;
          }
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
  function questionTypeShortString(t: Question["t"]): string {
    switch (t) {
      case "standard":
        return "Multiple Choice";
      case "tf":
        return "True or False";
      case "multi":
        return "Multi-Select";
      case "type":
        return "Type Answer";
      case "map":
        return "Map";
      case "text":
        return "Slide";
      default:
        return ((x: never) => {
          throw new Error(`Unreachable ${x}`);
        })(t);
    }
  }

  await new Promise((r) => {
    setTimeout(r, 1000);
  });
  return new Promise((r) => {
    let qID = 0;

    const send = (msg: GameStatePayload) => {
      socket.send("gameState", msg);
    };
    send({
      t: "setupQ",
      n: 0,
    });

    const wrap = Dom.div(Dom.h2("Manual Overrides"), "infoScreen gameControl");

    // Question Number Header and Control
    const qWrap = Dom.div(undefined, "questionNumWrap");
    wrap.appendChild(qWrap);
    const prevQBtn = Dom.button("⮜", () => {
      if (qID <= 0) {
        return;
      }
      qID--;
      send({
        t: "setupQ",
        n: qID,
      });
    });
    qWrap.appendChild(prevQBtn);
    const qIdUi = Dom.span(`${qID}`, "bigNum");
    const qText = Dom.p("Question", "qNum");
    qText.appendChild(qIdUi);
    qWrap.appendChild(qText);
    const nextQBtn = Dom.button("⮞", () => {
      if (qID >= numQuestions - 1) {
        return;
      }
      qID++;
      send({
        t: "setupQ",
        n: qID,
      });
    });
    qWrap.appendChild(nextQBtn);

    const progressWrap = Dom.div(undefined, "questionProgress");
    wrap.appendChild(progressWrap);

    const blankBtn = Dom.button(
      "Blank",
      () => {
        send({ t: "blank" });
      },
      "active",
    );
    const showQBtn = Dom.button("Question Only", () => {
      send({ t: "showQuestion" });
    });
    const showABtn = Dom.button("Question + Answer", () => {
      send({ t: "showAnswers" });
    });
    const countdownBtn = Dom.button("Accept Response", () => {
      send({ t: "countdown" });
    });
    const resultsBtn = Dom.button("Results", () => {
      send({ t: "displayAnswerResults" });
    });
    const leaderboardBtn = Dom.button("Leaderboard", () => {
      send({ t: "leaderboard" });
    });

    progressWrap.appendChild(blankBtn);
    progressWrap.appendChild(showQBtn);
    progressWrap.appendChild(showABtn);
    progressWrap.appendChild(countdownBtn);
    progressWrap.appendChild(resultsBtn);
    progressWrap.appendChild(leaderboardBtn);

    blankBtn.disabled = true;
    showABtn.disabled = true;
    countdownBtn.disabled = true;
    resultsBtn.disabled = true;

    const questionMeta = document.createElement("p");
    questionMeta.classList.add("questionMetadata");
    wrap.appendChild(questionMeta);

    const questionInfo = document.createElement("p");
    questionInfo.classList.add("questionPreview");
    wrap.appendChild(questionInfo);

    wrap.appendChild(Dom.h2("Game Control"));

    const bigBtnWrap = Dom.div(undefined, "bigBtnWrap");
    wrap.appendChild(bigBtnWrap);

    document.body.appendChild(wrap);

    function generateNextQuestionButton(isLeaderboard: boolean) {
      bigBtnWrap.replaceChildren(
        qID < numQuestions - 1
          ? Dom.button(
              isLeaderboard ? "Go to Leaderboard" : "Next Question",
              isLeaderboard
                ? () => {
                    send({ t: "leaderboard" });
                  }
                : () => {
                    qID++;
                    send({
                      t: "setupQ",
                      n: qID,
                    });
                  },
              "bigbtn",
            )
          : Dom.button(
              "End Game",
              () => {
                if (
                  // eslint-disable-next-line no-restricted-globals, no-alert
                  !confirm(
                    "Do you really want to end the game? This is permanent.",
                  )
                ) {
                  return;
                }
                send({ t: "blank" });
                setTimeout(() => {
                  send({ t: "gg" });
                  document.body.removeChild(wrap);
                  r();
                }, 1000);
              },
              "bigbtn",
            ),
      );
    }

    socket.on("gameState", (msg) => {
      const payload = JSON.parse(msg) as GameStateControllerResponse;
      switch (payload.t) {
        case "scores":
          break;
        case "state": {
          qID = payload.question;
          qIdUi.textContent = `${qID}`;
          questionInfo.textContent = payload.questionString;
          questionMeta.textContent =
            payload.questionType === "text"
              ? "Text Slide"
              : `${questionTypeShortString(payload.questionType)}, ${payload.questionPoints} pts, ${payload.questionTime} sec`;
          switch (payload.state) {
            case "blank": {
              blankBtn.disabled = true;
              showQBtn.disabled = false;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              blankBtn.className = "active";
              showQBtn.className = "";
              showABtn.className = "";
              countdownBtn.className = "";
              resultsBtn.className = "";
              leaderboardBtn.className = "";
              bigBtnWrap.replaceChildren(
                Dom.button(
                  "Show Question",
                  () => {
                    send({ t: "showQuestion" });
                  },
                  "bigbtn",
                ),
              );
              break;
            }
            case "question": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              // showABtn.disabled = ??? // see switch statement below
              countdownBtn.disabled = payload.questionType === "text";
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              blankBtn.className = "";
              showQBtn.className = "active";
              showABtn.className = "";
              countdownBtn.className = "";
              resultsBtn.className = "";
              leaderboardBtn.className = "";
              switch (payload.questionType) {
                case "text":
                  showABtn.disabled = true;
                  generateNextQuestionButton(false);
                  break;
                case "map":
                case "type":
                case "tf":
                  showABtn.disabled = true;
                  bigBtnWrap.replaceChildren(
                    Dom.button(
                      "Start Accepting Responses",
                      () => {
                        send({ t: "countdown" });
                      },
                      "bigbtn",
                    ),
                  );
                  break;
                default:
                  showABtn.disabled = false;
                  bigBtnWrap.replaceChildren(
                    Dom.button(
                      "Show Answers Only",
                      () => {
                        send({ t: "showAnswers" });
                      },
                      "bigbtn",
                    ),
                    Dom.button(
                      "Start Accepting Responses",
                      () => {
                        send({ t: "countdown" });
                      },
                      "bigbtn",
                    ),
                  );
              }
              break;
            }
            case "answers": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = false;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              blankBtn.className = "";
              showQBtn.className = "";
              showABtn.className = "active";
              countdownBtn.className = "";
              resultsBtn.className = "";
              leaderboardBtn.className = "";
              bigBtnWrap.replaceChildren(
                Dom.button(
                  "Start Accepting Responses",
                  () => {
                    send({ t: "countdown" });
                  },
                  "bigbtn",
                ),
              );
              break;
            }
            case "countdown": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = false;
              leaderboardBtn.disabled = false;
              blankBtn.className = "";
              showQBtn.className = "";
              showABtn.className = "";
              countdownBtn.className = "active";
              resultsBtn.className = "";
              leaderboardBtn.className = "";
              bigBtnWrap.replaceChildren(
                Dom.button(
                  "Stop Accepting Responses",
                  () => {
                    send({ t: "displayAnswerResults" });
                  },
                  "bigbtn",
                ),
              );
              break;
            }
            case "results": {
              blankBtn.disabled = false;
              showQBtn.disabled = true;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = false;
              blankBtn.className = "";
              showQBtn.className = "";
              showABtn.className = "";
              countdownBtn.className = "";
              resultsBtn.className = "active";
              leaderboardBtn.className = "";
              generateNextQuestionButton(true);
              break;
            }
            case "leaderboard": {
              blankBtn.disabled = false;
              showQBtn.disabled = false;
              showABtn.disabled = true;
              countdownBtn.disabled = true;
              resultsBtn.disabled = true;
              leaderboardBtn.disabled = true;
              blankBtn.className = "";
              showQBtn.className = "";
              showABtn.className = "";
              countdownBtn.className = "";
              resultsBtn.className = "";
              leaderboardBtn.className = "active";
              generateNextQuestionButton(false);
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
