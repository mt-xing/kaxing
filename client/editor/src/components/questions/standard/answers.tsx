import type { Question } from "@shared/question";
import "./standard.css";
import { useCallback } from "react";

export type StandardQuestionEditorProps = {
  q: Extract<Question, { t: "standard" }>;
  modify: (newQ: Question) => void;
};

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
  return (
    <>
      <label>
        Correct:{" "}
        <input
          type="radio"
          name="standardQuestionCorrect"
          checked={q.correct === i}
          value={i}
          onChange={(evt) => {
            modify({ ...q, correct: parseInt(evt.target.value, 10) });
          }}
        />
      </label>
      <textarea
        value={q.answers[i]}
        onChange={(evt) => setAnswer(evt.target.value)}
      ></textarea>
    </>
  );
}

export default function StandardQuestionAnswers(
  props: StandardQuestionEditorProps,
) {
  const { q, modify } = props;
  return (
    <>
      <div>
        <SingleAnswer q={q} modify={modify} i={0} />
        <SingleAnswer q={q} modify={modify} i={1} />
      </div>
      <div>
        <SingleAnswer q={q} modify={modify} i={2} />
        <SingleAnswer q={q} modify={modify} i={3} />
      </div>
    </>
  );
}
