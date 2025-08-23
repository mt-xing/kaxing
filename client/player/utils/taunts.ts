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
  "You cooked with that one",
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
  `Unfortunate`,
];
const WRONG_MEAN = [
  `git gud`,
  `Skill issue`,
  `Pro tip: instead of choosing the wrong answer, consider picking the correct one instead`,
  `It's a good thing it's not about the points, because you didn't get any`,
  `"I attempted to set low expectations for you. But you have even managed to underachieve on those." - Justine`,
  `When I say failure, you say yeah!`,
  `Neener neener`,
  `Cooked`,
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
// Taunts for when players answer very quickly
const FAST_CORRECT = [
  "... how did you get that?",
  "bruh I can't believe that worked",
  "Amazing guess",
  "I call hax",
  "You must be cheating",
];
const FAST_WRONG = [
  "Well that's embarassing",
  "You know being fast and wrong isn't worth anything, right?",
  "Did you misclick?",
  "Try taking the time to pick the correct answer",
  "Maybe slow down a bit",
];
// Taunts for when players answer very slowly
const SLOW_CORRECT = [
  "Slow and steady wins the race",
  "Coming in clutch last second",
  "Hey, if it works, it works",
  "Nice work. Slow work, but nice work.",
  "Incredible last second guess",
  "Sometimes a hail mary pays off",
];
const SLOW_WRONG = [
  "Worth a try",
  "Hey at least you got an answer in",
  "Good last second guess. Too bad it was wrong.",
  "Sadly, sometimes the hail mary doesn't work",
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
  } else if (!isTop && rank / numPlayers > 0.15) {
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
  answerTime: number | undefined;
  questionTime: number;
}) {
  if (state.correct === null) {
    return getEmptyString();
  } else if (state.correct) {
    if (state.answerTime !== undefined) {
      if (
        state.answerTime < 1 ||
        state.answerTime / state.questionTime < 0.025
      ) {
        return FAST_CORRECT[Math.floor(Math.random() * FAST_CORRECT.length)];
      }
      if (
        state.answerTime >= state.questionTime - 1 ||
        state.answerTime / state.questionTime > 0.95
      ) {
        return SLOW_CORRECT[Math.floor(Math.random() * SLOW_CORRECT.length)];
      }
    }
    return getCorrectString();
  } else {
    if (state.answerTime !== undefined) {
      if (
        state.answerTime < 1 ||
        state.answerTime / state.questionTime < 0.025
      ) {
        return FAST_WRONG[Math.floor(Math.random() * FAST_WRONG.length)];
      }
      if (
        state.answerTime >= state.questionTime - 1 ||
        state.answerTime / state.questionTime > 0.95
      ) {
        return SLOW_WRONG[Math.floor(Math.random() * SLOW_WRONG.length)];
      }
    }
    return getWrongString(state);
  }
}

const SUPER_FAST_RESPONSES = [
  "Did you even have time to read the question?",
  "You know I spent a lot of time on that question UI you didn't see",
  "That was too fast",
  "Fastest response in the west",
  "Are you sure sure?",
];

const FAST_RESPONSES = [
  "Were you too fast?",
  "That was fast",
  "No second thoughts, I hope",
  "Too late to change answers now",
];

const SLOW_RESPONSES = [
  "Response received",
  "Locked in",
  "Let's hope that's right",
  "Too late to change answers now",
];

export function getResponseText(time: number, totalTime: number) {
  if (time < 1) {
    return SUPER_FAST_RESPONSES[
      Math.floor(Math.random() * SUPER_FAST_RESPONSES.length)
    ];
  }
  const fraction = time / totalTime;
  if (fraction < 0.25 || time < 3) {
    return FAST_RESPONSES[Math.floor(Math.random() * FAST_RESPONSES.length)];
  }
  return SLOW_RESPONSES[Math.floor(Math.random() * SLOW_RESPONSES.length)];
}
