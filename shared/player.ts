import { Answer } from "./question";

export type Player = {
  name: string;
  score: number;
  answers: (Answer | null)[];
};
