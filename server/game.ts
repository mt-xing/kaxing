import * as io from "socket.io";
import {
  Answer,
  initResult,
  Question,
  QuestionResults,
  wasAnswerCorrect,
} from "../shared/question.js";
import { awardPoints, computeRanks, Player } from "../shared/player.js";
import { QuestionState } from "../shared/state.js";
import Communicator from "./comms.js";
import { GameStatePayload } from "./payloads.js";
import { assertUnreachable } from "../shared/util.js";

export default class KaXingGame {
  #questions: Question[];

  #questionResults: QuestionResults[];

  #controllerId: string;

  #players: Map<string, Player>;

  #comms: Communicator;

  /** Question index of question that questionState refers to */
  #currentQuestion: number;

  #questionState: QuestionState;

  /** Number of answers received for current question */
  #numAnswers: number;

  #firstQuestion: boolean;

  #currentCountdown?: {
    startTime: number;
    totalTimeout: ReturnType<typeof setTimeout>;
    responseTimeout: ReturnType<typeof setTimeout> | null;
  };

  constructor(
    namespace: io.Namespace,
    questions: Question[],
    boardId: string,
    controllerId: string,
    players: Map<string, Player>,
  ) {
    this.#questions = questions;
    this.#questionResults = questions.map(initResult);
    this.#controllerId = controllerId;
    this.#players = players;
    this.#comms = new Communicator(
      namespace,
      boardId,
      controllerId,
      players,
      questions,
    );
    this.#questionState = "blank";
    this.#currentQuestion = 0;
    this.#numAnswers = 0;
    this.#firstQuestion = true;
  }

  /**
   * Add a player to the game
   * @returns Whether joining was successful or not
   */
  addPlayer(id: string, name: string): boolean {
    if (this.#players.has(id)) {
      return false;
    }

    this.#players.set(id, {
      name,
      score: 0,
      answers: [],
      record: [],
      answerTimes: [],
    });
    this.#comms.addPlayer(id, name);
    return true;
  }

  isController(socketId: string) {
    return socketId === this.#controllerId;
  }

  handleControllerRequest(socket: io.Socket, msg: string) {
    if (!this.isController(socket.id)) {
      return;
    }
    const payload = JSON.parse(msg) as GameStatePayload;
    switch (payload.t) {
      case "adjustScore": {
        const p = this.#players.get(payload.player);
        if (p) {
          p.score = payload.score;
        }
        break;
      }
      case "setupQ":
        this.setQuestion(payload.n);
        break;
      case "blank":
        this.blank();
        break;
      case "showQuestion":
        this.showQuestion();
        break;
      case "showAnswers":
        this.showAnswers();
        break;
      case "countdown":
        this.countdown();
        break;
      case "displayAnswerResults":
        this.endCountdownShowResults();
        break;
      case "leaderboard":
        this.showLeaderboard();
        break;
      case "gg":
        this.#comms.sendGG();
        break;
      default:
        ((x: never) => {
          throw new Error(x);
        })(payload);
    }
  }

  setQuestion(questionId: number) {
    this.#clearCountdown();
    this.#currentQuestion = questionId;
    this.#questionState = "blank";
    this.#numAnswers = 0;
    this.#questionResults[questionId] = initResult(this.#questions[questionId]);
    this.#comms.sendQuestionReset(questionId);
    if (!this.#firstQuestion) {
      const ranks = computeRanks(this.#players);
      this.#players.forEach((x) => {
        // eslint-disable-next-line no-param-reassign
        x.previousRank = ranks.get(x);
      });
    } else {
      this.#firstQuestion = false;
    }
  }

  showQuestion() {
    this.#clearCountdown();
    if (this.#questionState === "question") {
      return;
    }
    this.#questionState = "question";
    this.#comms.sendShowQuestion(this.#currentQuestion);
  }

  showAnswers() {
    this.#clearCountdown();
    if (this.#questionState === "answers") {
      return;
    }
    this.#questionState = "answers";
    this.#comms.sendShowAnswers(this.#currentQuestion);
  }

  countdown() {
    this.#clearCountdown();
    if (this.#questionState === "countdown") {
      return;
    }
    if (this.#questions[this.#currentQuestion].t === "text") {
      return;
    }
    if (this.#questionState === "question") {
      this.#comms.sendShowAnswers(this.#currentQuestion);
    }
    this.#questionState = "countdown";
    this.#comms.sendCountdown(
      this.#currentQuestion,
      this.#questions[this.#currentQuestion],
    );

    this.#currentCountdown = {
      startTime: new Date().getTime(),
      responseTimeout: setTimeout(
        () => {
          this.#comms.sendBlankPlayer();
          if (this.#currentCountdown) {
            this.#currentCountdown.responseTimeout = null;
          }
        },
        1000 * (this.#questions[this.#currentQuestion].time + 2) - 500,
      ),
      totalTimeout: setTimeout(
        () => {
          this.endCountdownShowResults();
        },
        1000 * (this.#questions[this.#currentQuestion].time + 2),
      ),
    };
  }

  receiveResponse(socket: io.Socket, response: Answer) {
    if (!this.#currentCountdown) {
      return;
    }
    const q = this.#questions[this.#currentQuestion];
    if (q.t !== response.t) {
      return;
    }
    const pid = socket.id;
    const player = this.#players.get(pid ?? "");
    if (pid === undefined || player === undefined) {
      return;
    }

    player.answers[this.#currentQuestion] = response;
    const responseTime = new Date().getTime();
    player.answerTimes[this.#currentQuestion] =
      (responseTime - this.#currentCountdown.startTime) / 1000;
    if (wasAnswerCorrect(q, response)) {
      player.record[this.#currentQuestion] = awardPoints(
        player,
        responseTime,
        this.#currentCountdown.startTime,
        q,
      );
    } else {
      player.record[this.#currentQuestion] = 0;
    }

    const result = this.#questionResults[this.#currentQuestion];
    switch (q.t) {
      case "standard": {
        if (result.t === q.t && response.t === q.t) {
          result.responses[response.a]++;
        }
        break;
      }
      case "tf": {
        if (result.t === q.t && response.t === q.t) {
          if (response.a) {
            result.numTrue++;
          } else {
            result.numFalse++;
          }
        }
        break;
      }
      case "type": {
        if (result.t === q.t && response.t === q.t) {
          if (player.record[this.#currentQuestion] > 0) {
            result.numCorrect++;
          }
        }
        break;
      }
      case "map": {
        if (result.t === q.t && response.t === q.t) {
          if (player.record[this.#currentQuestion] > 0) {
            result.numCorrect++;
          } else {
            result.wrongCoords.push(response.a);
          }
        }
        break;
      }
      case "multi": {
        throw new Error("TODO: Unimplemented");
      }
      default:
        assertUnreachable(q);
    }

    this.#numAnswers++;
    this.#comms.sendResponseReceived(this.#numAnswers);
  }

  #clearCountdown() {
    if (this.#currentCountdown) {
      clearTimeout(this.#currentCountdown.totalTimeout);
      if (this.#currentCountdown.responseTimeout !== null) {
        clearTimeout(this.#currentCountdown.responseTimeout);
      }
      this.#currentCountdown = undefined;
    }
  }

  endCountdownShowResults() {
    this.#clearCountdown();
    if (this.#questionState === "results") {
      return;
    }
    if (this.#questions[this.#currentQuestion].t === "text") {
      return;
    }
    this.#questionState = "results";

    this.#comms.sendCountdownEnd(
      this.#currentQuestion,
      this.#questionResults[this.#currentQuestion],
    );
  }

  showLeaderboard() {
    this.#clearCountdown();
    if (this.#questionState === "leaderboard") {
      return;
    }
    this.#questionState = "leaderboard";
    this.#comms.sendLeaderboard(this.#currentQuestion);
  }

  blank() {
    this.#clearCountdown();
    this.#questionState = "blank";
    this.#comms.sendBlank(this.#currentQuestion);
  }

  get allDisconnected() {
    return this.#comms.allDisconnected;
  }
}
