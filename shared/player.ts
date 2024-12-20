import { Answer, Question } from "./question.js";

export type Player = {
  name: string;
  score: number;
  answers: (Answer | null)[];
  record: boolean[];
  /** Previous rank number (NOT zero-indexed) */
  previousRank?: number;
};

export function awardPoints(
  player: Player,
  answerTime: number,
  startTime: number,
  question: Question,
) {
  const timeLeft = startTime + question.time * 1000 - answerTime;
  const percentTimeLeft = Math.min(
    1,
    Math.max(0, timeLeft / (question.time * 1000)),
  );
  const halfPoints = question.points / 2;
  const points = halfPoints + percentTimeLeft * halfPoints;
  // eslint-disable-next-line no-param-reassign
  player.score += points;
}

export function computeRanks(
  players: Map<string, Player>,
): Map<Player, number> {
  const arr = Array.from(players);
  arr.sort((a, b) => b[1].score - a[1].score);
  const o = new Map<Player, number>();
  arr.forEach((x, i) => {
    o.set(x[1], i + 1);
  });
  return o;
}
