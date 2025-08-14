import type { Question } from "@shared/question";
import "./map.css";
import { useCallback } from "react";

export type MapQuestionEditorProps = {
  q: Extract<Question, { t: "map" }>;
  modify: (newQ: Question) => void;
  currentLat: number;
  currentLng: number;
  currentZoom: number;
};

export default function MapQuestionSidebar(props: MapQuestionEditorProps) {
  const { q, modify, currentLat, currentLng, currentZoom } = props;

  const setCenter = useCallback(() => {
    modify({
      ...q,
      startLat: currentLat,
      startLon: currentLng,
      startZoom: currentZoom,
    });
  }, [q, modify, currentLat, currentLng, currentZoom]);

  const setMin = useCallback(() => {
    modify({
      ...q,
      minZoom: currentZoom,
      maxZoom: q.maxZoom > currentZoom ? q.maxZoom : currentZoom,
    });
  }, [q, modify, currentZoom]);

  const setMax = useCallback(() => {
    modify({
      ...q,
      minZoom: q.minZoom < currentZoom ? q.minZoom : currentZoom,
      maxZoom: currentZoom,
    });
  }, [q, modify, currentZoom]);

  return (
    <>
      {q.correct.matches.length === 0 ? (
        <p className="warning">WARNING: This question has no correct answer</p>
      ) : null}
      {q.correct.matches.length > 0 &&
      q.correct.representativeAnswers.length === 0 ? (
        <p className="warning">
          WARNING: There are no sample answers to display
        </p>
      ) : null}
      <p>
        Current coords: [{currentLat.toFixed(2)}, {currentLng.toFixed(2)}]
      </p>
      <p>Current zoom: {currentZoom}</p>
      <h3>Starting Position</h3>
      <p>
        Coordinates: [
        <input
          type="number"
          className="mapValInput"
          value={parseFloat(q.startLat.toFixed(2))}
          onChange={(evt) =>
            modify({ ...q, startLat: parseFloat(evt.target.value) })
          }
        />
        ,{" "}
        <input
          type="number"
          className="mapValInput"
          value={parseFloat(q.startLon.toFixed(2))}
          onChange={(evt) =>
            modify({ ...q, startLon: parseFloat(evt.target.value) })
          }
        />
        ]
      </p>
      <p>
        Zoom:{" "}
        <input
          type="text"
          className="mapValInput"
          value={q.startZoom}
          onChange={(evt) => {
            const v = parseInt(evt.target.value, 10);
            if (Number.isNaN(v)) {
              return;
            }
            modify({
              ...q,
              startZoom: Math.min(18, Math.max(1, v)),
            });
          }}
        />
      </p>
      <p>
        <button className="bigbtn" onClick={setCenter}>
          Center Start on Current Map View
        </button>
      </p>
      <h3>Zoom Bounds</h3>
      <p>
        Min Zoom:{" "}
        <input
          type="text"
          className="mapValInput"
          value={q.minZoom}
          onChange={(evt) => {
            const v = parseInt(evt.target.value, 10);
            if (Number.isNaN(v)) {
              return;
            }
            modify({
              ...q,
              minZoom: Math.min(18, Math.max(1, v)),
            });
          }}
          onBlur={() => {
            if (q.minZoom > q.maxZoom) {
              modify({ ...q, maxZoom: q.minZoom });
            }
          }}
        />
        <button className="bigbtn" onClick={setMin}>
          Set to Current Zoom
        </button>
      </p>
      <p>
        Max Zoom:{" "}
        <input
          type="text"
          className="mapValInput"
          value={q.maxZoom}
          onChange={(evt) => {
            const v = parseInt(evt.target.value, 10);
            if (Number.isNaN(v)) {
              return;
            }
            modify({
              ...q,
              maxZoom: Math.min(18, Math.max(1, v)),
            });
          }}
          onBlur={() => {
            if (q.minZoom > q.maxZoom) {
              modify({ ...q, minZoom: q.maxZoom });
            }
          }}
        />
        <button className="bigbtn" onClick={setMax}>
          Set to Current Zoom
        </button>
      </p>
    </>
  );
}
