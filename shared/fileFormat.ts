import type { Question } from "./question.js";

export type KaXingSaveFile = {
  game: "kaxing";
  version: "1.0.0";
  title: string;
  addlQuestions?: string[];
  questions: Question[];
};
