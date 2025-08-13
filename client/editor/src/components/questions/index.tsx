import type { Question } from "@shared/question";
import "./QuestionEditor.css";
import { getQuestionShortString } from "../../utils/questions";
import StandardQuestionAnswers from "./standard/answers";
import StandardQuestionSidebar from "./standard/sidebar";
import TfQuestionAnswers from "./tf/answers";
import { useCallback, useState } from "react";
import TypeQuestionAnswers from "./type/answers";
import TypeQuestionSidebar from "./type/sidebar";
import MapQuestionAnswers from "./map/answers";
import MapQuestionSidebar from "./map/sidebar";

export type QuestionEditorProps = {
  q: Question;
  modify: (newQ: Question | ((o: Question) => Question)) => void;
  deleteQ: () => void;
};

export default function QuestionEditor(props: QuestionEditorProps) {
  const { q, modify, deleteQ } = props;
  const [tentativeType, setTentativeType] = useState(q.t);
  // lat, lng, zoom
  const [mapCoords, setMapCoords] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const changeTentativeType = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) =>
      setTentativeType(evt.target.value as Question["t"]),
    [],
  );

  const confirmChangeType = useCallback(() => {
    modify((oldQuestion) => {
      const base = {
        text: oldQuestion.text,
        img: oldQuestion.img,
        points: oldQuestion.points,
        time: oldQuestion.time,
      };
      switch (tentativeType) {
        case "standard":
          return {
            ...base,
            t: "standard",
            answers: ["", "", "", ""],
            correct: 0,
          };
        case "tf":
          return {
            ...base,
            t: "tf",
            correct: true,
          };
        case "multi":
          throw new Error("Unimplemented");
        case "type":
          return {
            ...base,
            t: "type",
            correct: {
              regex: "^$",
              representativeAnswers: [""],
            },
            caseInsensitive: true,
            maxChars: 20,
          };
        case "map":
          return {
            ...base,
            t: "map",
            // Hard-coded default: Cornell University Central Campus
            startLat: 42.44597494631099,
            startLon: -76.47993615775893,
            startZoom: 15,
            minZoom: 15,
            maxZoom: 18,
            correct: {
              matches: [],
              representativeAnswers: [],
            },
          };
        case "text":
          return {
            ...base,
            t: "text",
          };
      }
    });
  }, [modify, tentativeType]);

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
        {q.t === "type" ? <TypeQuestionAnswers q={q} modify={modify} /> : null}
        {q.t === "map" ? (
          <MapQuestionAnswers
            q={q}
            modify={modify}
            setMapCoords={setMapCoords}
          />
        ) : null}
      </section>
      <section className="sidebar card">
        <h2>{getQuestionShortString(q.t)}</h2>
        <p>
          <label>
            Change type:{" "}
            <select value={tentativeType} onChange={changeTentativeType}>
              <option value="standard">Multiple Choice</option>
              <option value="tf">True or False</option>
              <option value="type">Type Answer</option>
              <option value="map">Map</option>
              <option value="text">Slide</option>
            </select>
          </label>
          <button
            className="bigbtn smallbtn"
            onClick={confirmChangeType}
            disabled={tentativeType === q.t}
          >
            Confirm
          </button>
        </p>
        {tentativeType !== q.t ? (
          <p className="warning">
            Changing the question type deletes all type-specific answer
            information (not the text, image, points, or time)
          </p>
        ) : null}
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
            {q.t === "type" ? (
              <TypeQuestionSidebar q={q} modify={modify} />
            ) : null}
            {q.t === "map" ? (
              <MapQuestionSidebar
                q={q}
                modify={modify}
                currentLat={mapCoords[0]}
                currentLng={mapCoords[1]}
                currentZoom={mapCoords[2]}
              />
            ) : null}
            <p>
              <button onClick={deleteQ} className="bigbtn">
                Delete Question
              </button>
            </p>
          </>
        )}
      </section>
    </>
  );
}
