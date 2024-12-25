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
  `git gud`,
  `Skill issue`,
  `Pro tip: instead of choosing the wrong answer, consider picking the correct one instead`,
  `It's not about the points`,
  `It's a good thing it's not about the points, because you didn't get any`,
  `You know being fast and wrong isn't worth anything, right?`,
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
  `Neener neener`,
  `Cosmic ray must've changed your answer`,
  `Not very girlboss of you`,
  `"I attempted to set low expectations for you. But you have even managed to underachieve on those." - Justine`,
  `It be like that sometimes`,
  `Not very brat coded`,
  `When I say failure, you say yeah!`,
  `"2 + 2 = 10... in base 4 I'M FINE" - GLaDOS`,
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

export function getWrongString() {
  return WRONG[Math.floor(Math.random() * WRONG.length)];
}

export function getEmptyString() {
  return NONE[Math.floor(Math.random() * NONE.length)];
}

export function getTaunt(correct: boolean | null) {
  if (correct === null) {
    return getEmptyString();
  } else if (correct) {
    return getCorrectString();
  } else {
    return getWrongString();
  }
}
