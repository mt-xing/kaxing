import * as io from "socket.io";
import { Answer, Question, wasAnswerCorrect } from "../shared/question.js";
import { awardPoints, computeRanks, Player } from "../shared/player.js";
import { QuestionState } from "../shared/state.js";
import Communicator from "./comms.js";
import {
  GameStateBoardResponse,
  GameStateClientResponse,
  GameStateControllerResponse,
} from "./payloads.js";

export default class KaXingGame {
  #questions: Question[];

  #board: io.Socket;

  #controller: io.Socket;

  #players: Map<string, { socket: io.Socket } & Player>;

  #comms: Communicator;

  /** Question index of question that questionState refers to */
  #currentQuestion: number;

  #questionState: QuestionState;

  /** Number of answers received for current question */
  #numAnswers: number;

  #currentCountdown?: {
    startTime: number;
    timeout: ReturnType<typeof setTimeout>;
  };

  constructor(
    questions: Question[],
    board: io.Socket,
    controller: io.Socket,
    players: Map<string, { socket: io.Socket } & Player>,
  ) {
    this.#questions = questions;
    this.#board = board;
    this.#controller = controller;
    this.#players = players;
    this.#comms = new Communicator(board, controller, players);
    this.#questionState = "blank";
    this.#currentQuestion = 0;
    this.#numAnswers = 0;
  }

  private sendToAllPlayers(msg: GameStateClientResponse) {
    this.#players.forEach((p) =>
      p.socket.emit("gameState", JSON.stringify(msg)),
    );
  }

  private sendToController(msg: GameStateControllerResponse) {
    this.#controller.emit("gameState", JSON.stringify(msg));
  }

  private sendToBoard(msg: GameStateBoardResponse) {
    this.#board.emit("gameState", JSON.stringify(msg));
  }

  private sendQuestionStateToController() {
    this.sendToController({
      t: "state",
      question: this.#currentQuestion,
      state: this.#questionState,
    });
  }

  setQuestion(questionId: number) {
    this.#currentQuestion = questionId;
    this.#questionState = "blank";
    this.#numAnswers = 0;
    this.sendToAllPlayers({ t: "blank" });
    this.sendToBoard({ t: "setupQ", n: questionId });
    this.sendQuestionStateToController();
  }

  showQuestion() {
    if (this.#questionState === "question") {
      return;
    }
    this.#questionState = "question";
    this.sendToBoard({ t: "showQuestion" });
    this.sendQuestionStateToController();
  }

  showAnswers() {
    if (this.#questionState === "answers") {
      return;
    }
    this.#questionState = "answers";
    this.sendToBoard({ t: "showAnswers" });
    this.sendQuestionStateToController();
  }

  countdown() {
    if (this.#questionState === "countdown") {
      return;
    }
    this.#questionState = "countdown";
    this.sendToBoard({ t: "countdown" });
    this.sendToAllPlayers({
      t: "acceptResponse",
      q: this.#questions[this.#currentQuestion],
    });
    this.sendQuestionStateToController();

    this.#currentCountdown = {
      startTime: new Date().getTime(),
      timeout: setTimeout(
        () => {
          this.endCountdownShowResults();
        },
        1000 * (this.#questions[this.#currentQuestion].time + 1),
      ),
    };
  }

  getResponse(socket: io.Socket, response: Answer) {
    if (!this.#currentCountdown) {
      return;
    }
    const q = this.#questions[this.#currentQuestion];
    if (q.t !== response.t) {
      return;
    }
    const pid = this.#comms.getPlayerId(socket);
    const player = this.#players.get(pid ?? "");
    if (pid === undefined || player === undefined) {
      return;
    }

    player.answers[this.#currentQuestion] = response;
    player.record[this.#currentQuestion] = wasAnswerCorrect(q, response);
    if (player.record[this.#currentQuestion]) {
      awardPoints(
        player,
        new Date().getTime(),
        this.#currentCountdown.startTime,
        q,
      );
    }

    this.#numAnswers++;
    this.sendToBoard({
      t: "answerReceived",
      n: this.#numAnswers,
      d: this.#players.size,
    });

    this.sendToController({
      t: "scores",
      players: Array.from(this.#players).reduce(
        (a, x) => ({
          ...a,
          [x[0]]: x[1].score,
        }),
        {},
      ),
    });
    this.sendQuestionStateToController();
  }

  endCountdownShowResults() {
    if (this.#currentCountdown) {
      clearTimeout(this.#currentCountdown.timeout);
      this.#currentCountdown = undefined;
    }
    if (this.#questionState === "results") {
      return;
    }
    this.#questionState = "results";

    const ranks = computeRanks(this.#players);

    this.#players.forEach((p) => {
      const msg: GameStateClientResponse = {
        t: "result",
        correct: p.record[this.#currentQuestion] ?? null,
        points: p.score,
        history: p.record,
        rank: ranks.get(p) ?? -1,
      };
      p.socket.emit("gameState", JSON.stringify(msg));
    });
  }

  showLeaderboard() {
    if (this.#questionState === "leaderboard") {
      return;
    }
    this.#questionState = "leaderboard";
    const ranks = computeRanks(this.#players);

    this.#players.forEach((p) => {
      const msg: GameStateClientResponse = {
        t: "text",
        text: `${ranks.get(p)}th place with ${p.score} point${p.score === 1 ? "" : "s"}`,
      };
      p.socket.emit("gameState", JSON.stringify(msg));
    });
    this.sendToBoard({ t: "leaderboard" });
    this.sendQuestionStateToController();
  }

  blank() {
    this.#questionState = "blank";
    this.sendToBoard({ t: "blank" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController();
  }
}
