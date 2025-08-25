import type { Question } from "@shared/question";

export function getQuestionShortString(q: Question["t"]): string {
  switch (q) {
    case "standard":
      return "Multiple Choice";
    case "multi":
      return "Select All";
    case "tf":
      return "True or False";
    case "type":
      return "Type Answer";
    case "map":
      return "Map";
    case "text":
      return "Slide";
  }
}

export function getDefaultQuestion(): Question {
  return {
    t: "standard",
    points: 1000,
    time: 20,
    text: "",
    answers: ["", "", "", ""],
    correct: 0,
  };
}
