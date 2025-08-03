import type { Question } from "@shared/question";
import "./standard.css";

export type StandardQuestionEditorProps = {
  q: Extract<Question, { t: "standard" }>;
};

export default function StandardQuestionAnswers(
  props: StandardQuestionEditorProps,
) {
  const { q } = props;
  return (
    <>
      <div>
        <textarea>{q.answers[0]}</textarea>
        <textarea>{q.answers[1]}</textarea>
      </div>
      <div>
        <textarea>{q.answers[2]}</textarea>
        <textarea>{q.answers[3]}</textarea>
      </div>
    </>
  );
}
