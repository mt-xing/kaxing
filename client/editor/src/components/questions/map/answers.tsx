import type { Question } from "@shared/question";
import "./map.css";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import haversineDistance from "haversine-distance";
import { useState } from "react";

export type MapQuestionEditorProps = {
  q: Extract<Question, { t: "map" }>;
  modify: (newQ: Question) => void;
};

type AddState = "pin" | "range center" | "range radius";

function getInstruction(state: AddState | null): string {
  if (!state) {
    return "";
  }
  switch (state) {
    case "pin":
      return "Click on the map to add an answer pin";
    case "range center":
      return "Click on the map to choose where to center an acceptance range";
    case "range radius":
      return "Click on the map away from the center to choose how wide to make the range";
  }
}

export default function MapQuestionAnswers(props: MapQuestionEditorProps) {
  const { q, modify } = props;
  const [addState, setAddState] = useState<AddState | null>(null);
  return (
    <>
      <p>
        <button
          className="bigbtn"
          disabled={addState !== null}
          onClick={() => {
            setAddState("pin");
          }}
        >
          Add Answer Pin
        </button>
        <button
          className="bigbtn"
          disabled={addState !== null}
          onClick={() => {
            setAddState("range center");
          }}
        >
          Add Accepted Range
        </button>
        <span>{getInstruction(addState)}</span>
      </p>
      <MapContainer
        center={[q.startLat, q.startLon]}
        zoom={q.startZoom}
        style={{ height: "calc(60vh - 300px)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {q.correct.matches.map((match) => (
          <Circle
            center={match.center}
            pathOptions={{ fillColor: "blue" }}
            radius={haversineDistance(
              { latitude: match.center[0], longitude: match.center[1] },
              {
                latitude: match.center[0] + match.radius,
                longitude: match.center[1],
              },
            )}
            key={JSON.stringify(match.center)}
          >
            <Popup>
              <button className="bigbtn popupBtn">Delete This Range</button>
            </Popup>
          </Circle>
        ))}
        {q.correct.representativeAnswers.map((answer) => (
          <Marker position={answer}>
            <Popup>
              <button
                style={{ position: "relative", zIndex: 2 }}
                className="bigbtn"
              >
                Delete This Pin
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
