import type { Question } from "@shared/question";
import "./standard.css";
import { useCallback } from "react";

export type StandardQuestionEditorProps = {
  q: Extract<Question, { t: "standard" }>;
  modify: (newQ: Question) => void;
};

const defaultNumericSort = (a: number, b: number) => a - b;

function SingleAnswer(props: StandardQuestionEditorProps & { i: number }) {
  const { q, modify, i } = props;
  const setAnswer = useCallback(
    (text: string) => {
      const answers = q.answers.slice();
      answers[i] = text;
      modify({
        ...q,
        answers,
      });
    },
    [modify, q, i],
  );
  const toggleCorrect = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof q.correct === "number") {
        if (q.correct === i) {
          return;
        }
        modify({ ...q, correct: i });
        return;
      }

      const valSet = new Set<number>(q.correct);
      if (evt.target.checked) {
        valSet.add(i);
      } else {
        valSet.delete(i);
      }
      const newArr = [...valSet].sort(defaultNumericSort);
      modify({ ...q, correct: newArr });
    },
    [modify, q, i],
  );
  return (
    <div className="answer">
      <label>
        <input
          type={typeof q.correct === "number" ? "radio" : "checkbox"}
          name="standardQuestionCorrect"
          checked={
            typeof q.correct === "number"
              ? q.correct === i
              : q.correct.indexOf(i) !== -1
          }
          value={i}
          onChange={toggleCorrect}
        />
      </label>
      <textarea
        value={q.answers[i]}
        onChange={(evt) => setAnswer(evt.target.value)}
      ></textarea>
    </div>
  );
}

export default function StandardQuestionAnswers(
  props: StandardQuestionEditorProps,
) {
  const { q, modify } = props;
  return (
    <>
      <div className="answerRow">
        <SingleAnswer q={q} modify={modify} i={0} />
        <SingleAnswer q={q} modify={modify} i={1} />
      </div>
      <div className="answerRow">
        <SingleAnswer q={q} modify={modify} i={2} />
        <SingleAnswer q={q} modify={modify} i={3} />
      </div>
    </>
  );
}
