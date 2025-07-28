import * as io from "socket.io";
import {
  DistributiveOmit,
  GameStateBoardResponse,
  GameStateClientResponse,
  GameStateControllerResponse,
} from "../shared/payloads.js";
import { QuestionState } from "../shared/state.js";
import { Question, QuestionResults } from "../shared/question.js";
import { computeRanks, Player } from "../shared/player.js";

export default class Communicator {
  #namespace: io.Namespace;

  #boardId: string;

  #controllerId: string;

  #players: Map<string, Player>;

  #questions: Question[];

  constructor(
    namespace: io.Namespace,
    boardId: string,
    controllerId: string,
    players: Map<string, Player>,
    questions: Question[],
  ) {
    this.#namespace = namespace;
    this.#boardId = boardId;
    this.#controllerId = controllerId;
    this.#players = players;
    this.#questions = questions;
  }

  private sendToPlayer(pid: string, msg: GameStateClientResponse) {
    this.#namespace.to(pid).emit("gameState", JSON.stringify(msg));
  }

  private sendToAllPlayers(msg: GameStateClientResponse) {
    this.#players.forEach((_p, pid) => this.sendToPlayer(pid, msg));
  }

  private sendToController(msg: GameStateControllerResponse) {
    this.#namespace
      .to(this.#controllerId)
      .emit("gameState", JSON.stringify(msg));
  }

  private sendToBoard(msg: GameStateBoardResponse) {
    this.#namespace.to(this.#boardId).emit("gameState", JSON.stringify(msg));
  }

  private sendQuestionStateToController(
    currentQuestion: number,
    state: QuestionState,
  ) {
    const q = this.#questions[currentQuestion];
    this.sendToController({
      t: "state",
      question: currentQuestion,
      questionString: `Type: ${q.t}\nText: ${q.text}\nTime: ${q.time} sec`,
      state,
    });
  }

  /**
   * Add a player to the game
   * @returns Whether joining was successful or not
   */
  addPlayer(id: string, name: string) {
    this.#namespace
      .to(this.#boardId)
      .emit("join", JSON.stringify({ id, name }));
    this.#namespace
      .to(this.#controllerId)
      .emit("join", JSON.stringify({ id, name }));
  }

  sendQuestionReset(q: number) {
    this.sendToAllPlayers({ t: "blank" });
    this.sendToBoard({ t: "setupQ", n: q });
    this.sendQuestionStateToController(q, "blank");
  }

  sendShowQuestion(q: number) {
    this.sendToBoard({
      t: "showQuestionBoard",
      numPlayers: this.#players.size,
    });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "question");
  }

  sendShowAnswers(q: number) {
    this.sendToBoard({ t: "showAnswers" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "answers");
  }

  sendCountdown(qNum: number, q: Question) {
    const playerQ: DistributiveOmit<Question, "correct"> & {
      correct?: unknown;
    } = {
      ...q,
    };
    delete playerQ.correct;
    this.sendToBoard({ t: "countdown" });
    this.sendToAllPlayers({
      t: "acceptResponse",
      q: playerQ,
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

  sendCountdownEnd(q: number, results: QuestionResults) {
    const ranks = computeRanks(this.#players);
    this.#players.forEach((p, pid) => {
      this.sendToPlayer(pid, {
        t: "result",
        correct: p.record[q] ?? null,
        points: p.score,
        history: p.record,
        rank: ranks.get(p) ?? -1,
        numPlayers: this.#players.size,
      });
    });
    this.sendToBoard({
      t: "displayAnswerResultsBoard",
      results,
      numPlayers: this.#players.size,
    });
    this.sendQuestionStateToController(q, "results");
  }

  sendLeaderboard(q: number) {
    const ranks = computeRanks(this.#players);
    const currentPlayerRank: Player[] = [];

    this.#players.forEach((p, pid) => {
      const rank = ranks.get(p) ?? Infinity;
      this.sendToPlayer(pid, {
        t: "text",
        text: `Rank ${rank} with ${Math.round(p.score)} points`,
      });
      if (rank < 6) {
        currentPlayerRank[rank - 1] = p;
      }
    });
    this.sendToBoard({
      t: "leaderboardBoard",
      leaderboard: currentPlayerRank.map((x, i) => ({
        name: x.name,
        points: x.score,
        diff: x.previousRank === undefined ? 0 : x.previousRank - (i + 1),
      })),
    });
    this.sendQuestionStateToController(q, "leaderboard");
  }

  sendBlankPlayer() {
    this.sendToAllPlayers({ t: "blank" });
  }

  sendBlank(q: number) {
    this.sendToBoard({ t: "blank" });
    this.sendToAllPlayers({ t: "blank" });
    this.sendQuestionStateToController(q, "blank");
  }

  sendGG() {
    const currentPlayerRank: Player[] = [...this.#players]
      .map((x) => x[1])
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    this.sendToAllPlayers({ t: "blank" });
    this.sendToBoard({
      t: "ggBoard",
      leaderboard: currentPlayerRank.map((x) => ({
        name: x.name,
        points: x.score,
      })),
    });
    setTimeout(() => {
      const ranks = computeRanks(this.#players);

      this.#players.forEach((p, pid) => {
        const rank = ranks.get(p) ?? Infinity;
        this.sendToPlayer(pid, {
          t: "text",
          text: `Rank ${rank} with ${Math.round(p.score)} points`,
        });
      });
    }, 16000);
  }

  get allDisconnected() {
    const boardSocket = this.#namespace.sockets.get(this.#boardId);
    if (boardSocket?.connected) {
      return false;
    }

    const controlSocket = this.#namespace.sockets.get(this.#controllerId);
    if (controlSocket?.connected) {
      return false;
    }

    for (const p of this.#players) {
      const [pid] = p;
      const pSocket = this.#namespace.sockets.get(pid);
      if (pSocket?.connected) {
        return false;
      }
    }

    return true;
  }
}
