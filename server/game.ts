import * as io from "socket.io";
import { Answer, Question, wasAnswerCorrect } from "../shared/question.js";
import { awardPoints, Player } from "../shared/player.js";
import { QuestionState } from "../shared/state.js";
import Communicator from "./comms.js";

export default class KaXingGame {
  #questions: Question[];

  #players: Map<string, Player>;

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
    this.#players = players;
    this.#comms = new Communicator(board, controller, players);
    this.#questionState = "blank";
    this.#currentQuestion = 0;
    this.#numAnswers = 0;
  }

  setQuestion(questionId: number) {
    this.#currentQuestion = questionId;
    this.#questionState = "blank";
    this.#numAnswers = 0;
    this.#comms.sendQuestionReset(questionId);
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
