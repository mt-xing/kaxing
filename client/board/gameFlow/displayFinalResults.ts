import TextUi from "../../player/ui/text.js";
import { playGG } from "../audio.js";
import { longConfetti, shortConfettiBlast } from "../utils/confetti.js";
import CreditsUi from "../ui/credits.js";
import FinalResultsUi from "../ui/finalResults.js";
import Leaderboard from "../ui/leaderboard.js";

export default async function displayResults(
  leaderboard: { name: string; points: number }[],
) {
  playGG();

  const fixedLeaderboard = [0, 1, 2].map((i) =>
    leaderboard[i] === undefined ? { name: "N/A", points: 0 } : leaderboard[i],
  );

  let ui: TextUi | undefined;
  let fui: FinalResultsUi | undefined;
  const showText = (text: string, start: number, end: number) => {
    setTimeout(() => {
      ui = new TextUi(document.body, text);
    }, start);
    setTimeout(() => {
      ui?.remove();
      ui = undefined;
    }, end);
  };
  const showPlace = (
    rank: number,
    name: string,
    points: number,
    start: number,
    nameTime: number,
    end: number,
  ) => {
    setTimeout(() => {
      fui = new FinalResultsUi(document.body, rank, name, points);
    }, start);
    setTimeout(() => {
      fui?.showName();
    }, nameTime);
    setTimeout(() => {
      shortConfettiBlast();
      if (rank === 1) {
        longConfetti();
      }
    }, nameTime + 300);
    setTimeout(() => {
      fui?.remove();
      fui = undefined;
    }, end);
  };

  showText("Results", 0, 2500);
  showPlace(
    3,
    fixedLeaderboard[2].name,
    Math.round(fixedLeaderboard[2].points),
    2500,
    4000,
    6500,
  );
  showPlace(
    2,
    fixedLeaderboard[1].name,
    Math.round(fixedLeaderboard[1].points),
    6500,
    8000,
    10500,
  );
  showText("Pause for dramatic effect...", 10500, 12000);
  showPlace(
    1,
    fixedLeaderboard[0].name,
    Math.round(fixedLeaderboard[0].points),
    12000,
    13500,
    15500,
  );
  setTimeout(() => {
    const l = new Leaderboard(
      document.body,
      leaderboard.map((x) => ({ ...x, diff: 0 })),
    );

    setTimeout(() => {
      l.slideLeft();
      new CreditsUi(document.body);
    }, 1000);
  }, 16000);
}
