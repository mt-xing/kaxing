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
      correctRegex: string;
      representativeAnswers: string[];
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
      return new RegExp(q.correctRegex).test(a.a.trim());
    case "tf":
      if (a.t !== "tf") {
        return false;
      }
      return a.a === q.correct;
    case "text":
      return true;
    default:
      ((x: never) => {
        throw new Error(x);
      })(q);
  }
}
