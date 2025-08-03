import type { Question } from "@shared/question";
import "../standard/standard.css";
import { useCallback } from "react";

export type TfQuestionEditorProps = {
  q: Extract<Question, { t: "tf" }>;
  modify: (newQ: Question) => void;
};

function SingleAnswer(props: TfQuestionEditorProps & { isTrue: boolean }) {
  const { q, modify, isTrue } = props;
  const toggleCorrect = useCallback(
    (_evt: React.ChangeEvent<HTMLInputElement>) => {
      modify({ ...q, correct: isTrue });
    },
    [modify, q, isTrue],
  );
  return (
    <div className="answer">
      <input
        type="radio"
        name="tfQuestionCorrect"
        checked={q.correct === isTrue}
        value={`${isTrue}`}
        onChange={toggleCorrect}
      />
      <p className="tfWrap">{isTrue ? "True" : "False"}</p>
    </div>
  );
}

export default function TfQuestionAnswers(props: TfQuestionEditorProps) {
  const { q, modify } = props;
  return (
    <div className="answerRow" style={{ marginTop: "5vh" }}>
      <SingleAnswer q={q} modify={modify} isTrue={true} />
      <SingleAnswer q={q} modify={modify} isTrue={false} />
    </div>
  );
}
