import type { Question } from "@shared/question";
import "./QuestionCarousel.css";
import { useCallback } from "react";
import { getQuestionShortString } from "../../utils/questions";

export type CarouselProps = {
  questions: Question[];
  selected: number;
  modifyQuestions: (newQuestions: Question[]) => void;
  selectQuestion: (index: number) => void;
};

export default function QuestionCarousel(props: CarouselProps) {
  const { questions, selected, modifyQuestions, selectQuestion } = props;
  const moveDir = useCallback(
    (i: number, isRight: boolean) => {
      if (i <= 0 && !isRight) {
        return;
      }
      if (i >= questions.length - 1 && isRight) {
        return;
      }
      const left = questions.slice(0, isRight ? i : i - 1);
      const swapped = isRight
        ? [questions[i + 1], questions[i]]
        : [questions[i], questions[i - 1]];
      const right = questions.slice(isRight ? i + 2 : i + 1);

      const final = left.concat(swapped, right);
      console.log(final);
      modifyQuestions(final);
      selectQuestion(isRight ? i + 1 : i - 1);
    },
    [questions, modifyQuestions, selectQuestion],
  );

  const jumpTo = useCallback(
    (startI: number, endI: number) => {
      if (startI === endI) {
        return;
      }
      if (
        startI < 0 ||
        endI < 0 ||
        startI >= questions.length ||
        endI >= questions.length
      ) {
        return;
      }

      const isMovingBack = endI > startI;

      const start = questions.slice(0, Math.min(startI, endI));
      const mid = questions.slice(
        isMovingBack ? startI + 1 : endI,
        isMovingBack ? endI + 1 : startI,
      );
      const end = questions.slice(Math.max(startI, endI) + 1);

      modifyQuestions(
        isMovingBack
          ? start.concat(mid, [questions[startI]], end)
          : start.concat([questions[startI]], mid, end),
      );

      if (startI === selected) {
        selectQuestion(endI);
      }
    },
    [questions, modifyQuestions, selectQuestion, selected],
  );

  return (
    <ul className="carousel">
      {questions.map((q, i) => (
        <li key={i}>
          <div>
            <button
              className="arrowBtn"
              disabled={i === 0}
              onClick={() => {
                moveDir(i, false);
              }}
            >
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
            <button
              className="arrowBtn"
              disabled={i === questions.length - 1}
              onClick={() => {
                moveDir(i, true);
              }}
            >
              ⮞
            </button>
          </div>
          <input
            name={`qNum${i}`}
            type="number"
            defaultValue={i + 1}
            onBlur={(evt) => {
              jumpTo(i, parseInt(evt.target.value, 10) - 1);
              evt.target.value = `${i + 1}`;
            }}
            onKeyDown={(evt) => {
              if (evt.key === "Enter") {
                // @ts-expect-error 2339
                evt.target.blur();
              }
            }}
          />
        </li>
      ))}
    </ul>
  );
}
