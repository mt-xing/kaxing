import type { Question } from "@shared/question";
import "./QuestionEditor.css";
import { getQuestionShortString } from "../../utils/questions";
import StandardQuestionAnswers from "./standard/answers";

export type QuestionEditorProps = {
  q: Question;
};

export default function QuestionEditor(props: QuestionEditorProps) {
  const { q } = props;
  return (
    <>
      <section className="question">
        <textarea>{q.text}</textarea>
        {q.t === "standard" ? <StandardQuestionAnswers q={q} /> : null}
      </section>
      <section className="sidebar card">
        <h2>{getQuestionShortString(q.t)}</h2>
        {q.t === "text" ? (
          <p>
            This is a static slide that does not involve players answering
            anything. The slide will stay on screen until the host advances to
            the next question.
          </p>
        ) : (
          <>
            <p>
              <label>
                Points: <input type="number" value={q.points} />
              </label>
            </p>
            <p>
              <label>
                Time: <input type="number" value={q.time} /> sec
              </label>
            </p>
          </>
        )}
      </section>
    </>
  );
}
