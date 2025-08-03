import type { Question } from "@shared/question";
import "./QuestionEditor.css";
import { getQuestionShortString } from "../../utils/questions";
import StandardQuestionAnswers from "./standard/answers";

export type QuestionEditorProps = {
  q: Question;
  modify: (newQ: Question) => void;
};

export default function QuestionEditor(props: QuestionEditorProps) {
  const { q, modify } = props;
  return (
    <>
      <section className="question">
        <textarea
          value={q.text}
          onChange={(evt) => modify({ ...q, text: evt.target.value })}
        ></textarea>
        {q.t === "standard" ? (
          <StandardQuestionAnswers q={q} modify={modify} />
        ) : null}
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
                Points:{" "}
                <input
                  type="number"
                  value={q.points}
                  onChange={(evt) =>
                    modify({ ...q, points: parseInt(evt.target.value, 10) })
                  }
                />
              </label>
            </p>
            <p>
              <label>
                Time:{" "}
                <input
                  type="number"
                  value={q.time}
                  onChange={(evt) =>
                    modify({ ...q, time: parseInt(evt.target.value, 10) })
                  }
                />{" "}
                sec
              </label>
            </p>
          </>
        )}
      </section>
    </>
  );
}
