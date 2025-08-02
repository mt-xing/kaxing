import type { Question } from "@shared/question";
import "./QuestionCarousel.css";

export type CarouselProps = {
  questions: Question[];
  selected: number;
  modifyQuestions: (newQuestions: Question[]) => void;
  selectQuestion: (index: number) => void;
};

function getQuestionShortString(q: Question["t"]): string {
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

export default function QuestionCarousel(props: CarouselProps) {
  const { questions, selected, modifyQuestions, selectQuestion } = props;
  return (
    <ul className="carousel">
      {questions.map((q, i) => (
        <li key={q.text}>
          <div>
            <button className="arrowBtn" disabled={i === 0}>
              ⮜
            </button>
            <button
              className={`mainBtn card${i === selected ? " activeQ" : ""}`}
              onClick={() => selectQuestion(i)}
            >
              <span className="qNumBg">{i + 1}</span>
              <strong>{getQuestionShortString(q.t)}</strong>
              <p>{q.text}</p>
            </button>
            <button className="arrowBtn" disabled={i === questions.length - 1}>
              ⮞
            </button>
          </div>
          <input name={`qNum${i}`} type="number" defaultValue={i + 1} />
        </li>
      ))}
    </ul>
  );
}
