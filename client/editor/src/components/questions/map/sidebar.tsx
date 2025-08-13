import type { Question } from "@shared/question";
import "./map.css";

export type MapQuestionEditorProps = {
  q: Extract<Question, { t: "map" }>;
  modify: (newQ: Question) => void;
  currentLat: number;
  currentLng: number;
  currentZoom: number;
};

export default function MapQuestionSidebar(props: MapQuestionEditorProps) {
  const { q, modify, currentLat, currentLng, currentZoom } = props;

  return (
    <>
      <p>Lat: {currentLat}</p>
      <p>Lng: {currentLng}</p>
      <p>Zom: {currentZoom}</p>
    </>
  );
}
