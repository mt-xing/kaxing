import * as io from "socket.io";
import { Answer, Question, wasAnswerCorrect } from "../shared/question.js";
import { awardPoints, computeRanks, Player } from "../shared/player.js";
import { QuestionState } from "../shared/state.js";
import Communicator from "./comms.js";
import { GameStatePayload } from "./payloads.js";

export default class KaXingGame {
  #questions: Question[];

  #controller: io.Socket;

  #players: Map<string, { socket: io.Socket } & Player>;

  #comms: Communicator;

  /** Question index of question that questionState refers to */
  #currentQuestion: number;

  #questionState: QuestionState;

  /** Number of answers received for current question */
  #numAnswers: number;

  #firstQuestion: boolean;

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
    this.#controller = controller;
    this.#players = players;
    this.#comms = new Communicator(board, controller, players);
    this.#questionState = "blank";
    this.#currentQuestion = 0;
    this.#numAnswers = 0;
    this.#firstQuestion = true;
  }

  isController(socket: io.Socket) {
    return socket === this.#controller;
  }

  handleControllerRequest(socket: io.Socket, msg: string) {
    if (!this.isController(socket)) {
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
      default:
        ((x: never) => {
          throw new Error(x);
        })(payload);
    }
  }

  setQuestion(questionId: number) {
    this.#currentQuestion = questionId;
    this.#questionState = "blank";
    this.#numAnswers = 0;
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
    if (this.#questionState === "question") {
      return;
    }
    this.#questionState = "question";
    this.#comms.sendShowQuestion(this.#currentQuestion);
  }

  showAnswers() {
    if (this.#questionState === "answers") {
      return;
    }
    this.#questionState = "answers";
    this.#comms.sendShowAnswers(this.#currentQuestion);
  }

  countdown() {
    if (this.#questionState === "countdown") {
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
      timeout: setTimeout(
        () => {
          this.endCountdownShowResults();
        },
        1000 * (this.#questions[this.#currentQuestion].time + 1),
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
    this.#comms.sendResponseReceived(this.#numAnswers);
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

    this.#comms.sendCountdownEnd(this.#currentQuestion);
  }

  showLeaderboard() {
    if (this.#questionState === "leaderboard") {
      return;
    }
    this.#questionState = "leaderboard";
    this.#comms.sendLeaderboard(this.#currentQuestion);
  }

  blank() {
    this.#questionState = "blank";
    this.#comms.sendBlank(this.#currentQuestion);
  }
}
