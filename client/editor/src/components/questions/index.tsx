import type { Question } from "@shared/question";
import "./QuestionEditor.css";
import { getQuestionShortString } from "../../utils/questions";
import StandardQuestionAnswers from "./standard/answers";
import StandardQuestionSidebar from "./standard/sidebar";
import TfQuestionAnswers from "./tf/answers";

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
          className="mainText"
          placeholder="Question Text Here"
          value={q.text}
          onChange={(evt) => modify({ ...q, text: evt.target.value })}
        ></textarea>
        <p className="imgUrlWrap">
          <input
            type="text"
            value={q.img ?? ""}
            placeholder="Image URL (Optional)"
            onChange={(evt) =>
              modify({
                ...q,
                img: evt.target.value ? evt.target.value : undefined,
              })
            }
          />
        </p>
        {q.img ? (
          <img src={q.img} alt="" className="imgPreview" />
        ) : (
          <div className="imgPreview">
            <p>
              I don't offer image hosting services. To add images, upload your
              picture to a third-party host like{" "}
              <a
                href="https://imgur.com"
                target="_blank"
                referrerPolicy="no-referrer"
              >
                Imgur
              </a>{" "}
              and paste the URL of the image file above.
            </p>
          </div>
        )}
        {q.t === "standard" ? (
          <StandardQuestionAnswers q={q} modify={modify} />
        ) : null}
        {q.t === "tf" ? <TfQuestionAnswers q={q} modify={modify} /> : null}
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
            {q.t === "standard" ? (
              <StandardQuestionSidebar q={q} modify={modify} />
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
