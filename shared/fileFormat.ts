import type { Question } from "./question.js";

export type KaXingSaveFile = {
  game: "kaxing";
  version: "1.0.0";
  title: string;
  author?: string;
  addlQuestions?: string[];
  questions: Question[];
  music?: {
    theme?: string;
    end?: string;
    gg?: string;
    q: Record<string, string[]>;
  };
};
