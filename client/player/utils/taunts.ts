const CORRECT = [
  "Nice!",
  "Nice™️",
  "skibidi rizz, as I'm told the kids say these days",
  "Correct",
  "Yep",
  "Woot woot",
  ":)",
  "Noice",
  "Great guess",
];
const WRONG = [
  `It's not about the points`,
  `"Class, remember to read the question very carefully"`,
  `We'll get 'em next time`,
  `It's okay`,
  `Just a misclick, right?`,
  `bruh`,
  `Close enough, amirite?`,
  `Computer says no`,
  `:/`,
  `Nice try`,
  `Uhhhhhh`,
  `Clearly not your fault — it was lag`,
  `Clearly not your fault — your brother was holding the controller`,
  `Clearly not your fault — you were playing on a USB steering wheel`,
  `Clearly not your fault — you were using tilt controls`,
  `Clearly not your fault — you were playing blindfolded`,
  `Cosmic ray must've changed your answer`,
  `Not very girlboss of you`,
  `It be like that sometimes`,
  `Not very brat coded`,
  `"2 + 2 = 10... in base 4 I'M FINE" - GLaDOS`,
];
const WRONG_MEAN = [
  `git gud`,
  `Skill issue`,
  `Pro tip: instead of choosing the wrong answer, consider picking the correct one instead`,
  `You know being fast and wrong isn't worth anything, right?`,
  `It's a good thing it's not about the points, because you didn't get any`,
  `"I attempted to set low expectations for you. But you have even managed to underachieve on those." - Justine`,
  `When I say failure, you say yeah!`,
  `Neener neener`,
];
const NONE = [
  `There's no guessing penalty in this game`,
  `So, like, you see that timer on the board?`,
  `No answer received`,
  `Too slow`,
  `You should try answering at some point`,
  `Too busy jamming to the music?`,
  `Remember to submit your answer`,
  `Clearly not your fault — it was lag`,
  `You still there?`,
];

export function getCorrectString() {
  return CORRECT[Math.floor(Math.random() * CORRECT.length)];
}

export function getWrongString({
  rank,
  numPlayers,
}: {
  rank: number;
  numPlayers: number;
}) {
  const isTop = numPlayers > 3 ? rank <= 2 : rank <= 1;

  if (rank / numPlayers > 0.5) {
    // Doing poorly
    return WRONG[Math.floor(Math.random() * WRONG.length)];
  } else if (!isTop && rank / numPlayers > 0.1) {
    // Doing mid
    const totalChoices = WRONG.length + WRONG_MEAN.length;
    const choice = Math.floor(Math.random() * totalChoices);
    if (choice < WRONG.length) {
      return WRONG[choice];
    } else {
      return WRONG_MEAN[choice - WRONG.length];
    }
  } else {
    // Doing well
    return WRONG_MEAN[Math.floor(Math.random() * WRONG_MEAN.length)];
  }
}

export function getEmptyString() {
  return NONE[Math.floor(Math.random() * NONE.length)];
}

export function getTaunt(state: {
  correct: boolean | null;
  history: (boolean | null | undefined)[];
  points: number;
  rank: number;
  numPlayers: number;
}) {
  if (state.correct === null) {
    return getEmptyString();
  } else if (state.correct) {
    return getCorrectString();
  } else {
    return getWrongString(state);
  }
}
