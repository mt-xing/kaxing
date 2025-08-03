import type { Question } from "@shared/question";

export function getQuestionShortString(q: Question["t"]): string {
  switch (q) {
    case "standard":
      return "Multiple Choice";
    case "multi":
      return "Multi-Select";
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
