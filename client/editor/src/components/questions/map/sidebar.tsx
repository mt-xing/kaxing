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

  return (
    <>
      <h3>Starting Position</h3>
      <p>
        Coordinates:{" "}
        <input
          type="text"
          className="disabledInput"
          value={`[${q.startLat.toFixed(2)}, ${q.startLon.toFixed(2)}]`}
        />
      </p>
      <p>
        Zoom:{" "}
        <input type="text" className="disabledInput" value={q.startZoom} />
      </p>
      <p>
        <button className="bigbtn" onClick={setCenter}>
          Center Start on Current Map View
        </button>
      </p>
      <h3>Zoom Bounds</h3>
      <p>
        Min Zoom:{" "}
        <input type="text" className="disabledInput" value={q.minZoom} />
      </p>
      <p>
        Max Zoom:{" "}
        <input type="text" className="disabledInput" value={q.maxZoom} />
      </p>
      <p>Lat: {currentLat.toFixed(2)}</p>
      <p>Lng: {currentLng.toFixed(2)}</p>
      <p>Zom: {currentZoom}</p>
    </>
  );
}
