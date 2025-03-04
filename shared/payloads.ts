import { Question, QuestionResults } from "./question.js";
import { QuestionState } from "./state.js";

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type ControllerJoinResponse = {
  password: string;
};

export type ErrorResponse = {
  reason: string;
};

export type ControllerSuccessResponse = {
  players: { name: string; id: string }[];
  numQuestions: number;
};

export type JoinRoomPayload = {
  name: string;
  id: string;
};

export type KickPlayerPayload = {
  id: string;
};

export type GameStatePayload =
  | {
      t: "setupQ";
      n: number;
    }
  | {
      t:
        | "blank"
        | "showQuestion"
        | "showAnswers"
        | "countdown"
        | "displayAnswerResults"
        | "leaderboard"
        | "gg";
    }
  | {
      t: "adjustScore";
      player: string;
      score: number;
    };

export type GameStateBoardResponse =
  | GameStatePayload
  | {
      t: "answerReceived";
      n: number;
      d: number;
    }
  | {
      t: "displayAnswerResultsBoard";
      results: QuestionResults;
      numPlayers: number;
    }
  | {
      t: "showQuestionBoard";
      numPlayers: number;
    }
  | {
      t: "leaderboardBoard";
      leaderboard: {
        name: string;
        points: number;
        diff: number;
      }[];
    }
  | {
      t: "ggBoard";
      leaderboard: {
        name: string;
        points: number;
      }[];
    };

export type GameStateControllerResponse =
  | {
      t: "scores";
      players: Record<string, number>;
    }
  | {
      t: "state";
      question: number;
      questionString: string;
      state: QuestionState;
    };

export type GameStateClientResponse =
  | {
      t: "blank";
    }
  | {
      t: "acceptResponse";
      q: DistributiveOmit<Question, "correct">;
    }
  | {
      t: "result";
      correct: boolean | null;
      history: (boolean | null | undefined)[];
      points: number;
      rank: number;
      numPlayers: number;
    }
  | {
      t: "text";
      text: string;
    };
