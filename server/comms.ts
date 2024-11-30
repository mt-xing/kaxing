import * as io from "socket.io";
import {
  GameStateBoardResponse,
  GameStateClientResponse,
  GameStateControllerResponse,
} from "../shared/payloads.js";
import { QuestionState } from "../shared/state.js";
import { Question } from "../shared/question.js";
import { computeRanks, Player } from "../shared/player.js";

export default class Communicator {
  #board: io.Socket;

  #controller: io.Socket;

  #players: Map<string, { socket: io.Socket } & Player>;

  #socketToPlayer: Map<string, string>;

  constructor(
    board: io.Socket,
    controller: io.Socket,
    players: Map<string, { socket: io.Socket } & Player>,
  ) {
    this.#board = board;
    this.#controller = controller;
    this.#players = players;
    this.#socketToPlayer = new Map();
    players.forEach(({ socket }, id) =>
      this.#socketToPlayer.set(socket.id, id),
    );
  }

  getPlayerId(socket: io.Socket): string | undefined {
    return this.#socketToPlayer.get(socket.id);
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

  private sendQuestionStateToController(
    currentQuestion: number,
    state: QuestionState,
  ) {
    this.sendToController({
      t: "state",
      question: currentQuestion,
      state,
    });
  }

  sendQuestionReset(q: number) {
    this.sendToAllPlayers({ t: "blank" });
    this.sendToBoard({ t: "setupQ", n: q });
    this.sendQuestionStateToController(q, "blank");
  }

  sendShowQuestion(q: number) {
    this.sendToBoard({ t: "showQuestion" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "question");
  }

  sendShowAnswers(q: number) {
    this.sendToBoard({ t: "showAnswers" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "answers");
  }

  sendCountdown(qNum: number, q: Question) {
    this.sendToBoard({ t: "countdown" });
    this.sendToAllPlayers({
      t: "acceptResponse",
      q,
    });
    this.sendQuestionStateToController(qNum, "countdown");
  }

  sendResponseReceived(num: number) {
    this.sendToBoard({
      t: "answerReceived",
      n: num,
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
  }

  sendCountdownEnd(q: number) {
    const ranks = computeRanks(this.#players);
    this.#players.forEach((p) => {
      const msg: GameStateClientResponse = {
        t: "result",
        correct: p.record[q] ?? null,
        points: p.score,
        history: p.record,
        rank: ranks.get(p) ?? -1,
      };
      p.socket.emit("gameState", JSON.stringify(msg));
    });
    this.sendQuestionStateToController(q, "results");
  }

  sendLeaderboard(q: number) {
    const ranks = computeRanks(this.#players);

    this.#players.forEach((p) => {
      const msg: GameStateClientResponse = {
        t: "text",
        text: `${ranks.get(p)}th place with ${p.score} point${p.score === 1 ? "" : "s"}`,
      };
      p.socket.emit("gameState", JSON.stringify(msg));
    });
    this.sendToBoard({ t: "leaderboard" });
    this.sendQuestionStateToController(q, "leaderboard");
  }

  sendBlank(q: number) {
    this.sendToBoard({ t: "blank" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "blank");
  }
}
