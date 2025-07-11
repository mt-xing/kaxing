export type Question = {
  points: number;
  time: number;
  text: string;
  img?: string;
} & (
  | {
      t: "standard";
      answers: string[];
      correct: number | number[];
    }
  | {
      t: "tf";
      correct: boolean;
    }
  | {
      t: "multi";
      answers: string[];
      correct: number[];
    }
  | {
      t: "type";
      maxChars: number;
      correct: {
        regex: string;
        representativeAnswers: string[];
      };
    }
  | {
      t: "map";
      startLat: number;
      startLon: number;
      startZoom: number;
      minZoom: number;
      maxZoom: number;
      correct: {
        matches: {
          center: [number, number];
          radius: number;
        }[];
        representativeAnswers: [number, number][];
      };
    }
  | {
      t: "text";
    }
);

export type Answer =
  | {
      t: "standard";
      a: number;
    }
  | {
      t: "multi";
      a: number[];
    }
  | {
      t: "type";
      a: string;
    }
  | {
      t: "tf";
      a: boolean;
    }
  | {
      t: "map";
      a: [number, number];
    };

export function wasAnswerCorrect(q: Question, a: Answer | null | undefined) {
  if (a === null || a === undefined) {
    return false;
  }
  switch (q.t) {
    case "standard": {
      if (a.t !== "standard") {
        return false;
      }
      if (typeof q.correct === "number") {
        return q.correct === a.a;
      }
      return q.correct.indexOf(a.a) > -1;
    }
    case "multi": {
      if (a.t !== "multi") {
        return false;
      }
      if (a.a.length !== q.correct.length) {
        return false;
      }
      const aSet = new Set(a.a);
      return q.correct.every((x) => aSet.has(x));
    }
    case "type":
      if (a.t !== "type") {
        return false;
      }
      return new RegExp(q.correct.regex, "i").test(a.a.trim());
    case "tf":
      if (a.t !== "tf") {
        return false;
      }
      return a.a === q.correct;
    case "map":
      if (a.t !== "map") {
        return false;
      }
      return q.correct.matches.some(
        (candidate) =>
          Math.sqrt(
            (candidate.center[0] - a.a[0]) ** 2 +
              (candidate.center[1] - a.a[1]) ** 2,
          ) <= candidate.radius,
      );
    case "text":
      return true;
    default:
      ((x: never) => {
        throw new Error(x);
      })(q);
  }
}

export type QuestionResults =
  | {
      t: "standard";
      responses: [number, number, number, number];
    }
  | {
      t: "tf";
      numTrue: number;
      numFalse: number;
    }
  | {
      t: "type";
      numCorrect: number;
    }
  | {
      t: "map";
      numCorrect: number;
      wrongCoords: [number, number][];
    }
  | {
      t: "other";
    };

export function initResult(q: Question): QuestionResults {
  switch (q.t) {
    case "multi":
    case "text":
      return {
        t: "other",
      };
    case "standard":
      return {
        t: "standard",
        responses: [0, 0, 0, 0],
      };
    case "tf":
      return {
        t: "tf",
        numTrue: 0,
        numFalse: 0,
      };
    case "type":
      return {
        t: "type",
        numCorrect: 0,
      };
    case "map":
      return {
        t: "map",
        numCorrect: 0,
        wrongCoords: [],
      };
    default:
      return ((x: never) => {
        throw new Error(x);
      })(q);
  }
}
