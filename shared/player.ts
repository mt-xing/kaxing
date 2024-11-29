import { Answer } from "./question.js";

export type Player = {
  name: string;
  score: number;
  answers: (Answer | null)[];
};
