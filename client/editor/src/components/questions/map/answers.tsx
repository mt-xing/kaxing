import type { Question } from "@shared/question";
import "./map.css";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import haversineDistance from "haversine-distance";
import { useCallback, useEffect, useState } from "react";
import L from "leaflet";

export type MapQuestionEditorProps = {
  q: Extract<Question, { t: "map" }>;
  modify: (newQ: Question) => void;
  setMapCoords: (coord: [number, number, number]) => void;
};

type AddState =
  | { t: "pin" }
  | { t: "range center" }
  | { t: "range radius"; center: [number, number] };

function getInstruction(state: AddState | null): string {
  if (!state) {
    return "";
  }
  switch (state.t) {
    case "pin":
      return "Click on the map to add a sample answer pin";
    case "range center":
      return "Click on the map to choose where to center an acceptance range";
    case "range radius":
      return "Click on the map away from the center to choose how wide to make the range";
  }
}

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickPassthrough(props: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvent("click", (evt) => {
    const { lat, lng } = evt.latlng;
    props.onClick(lat, lng);
  });
  return null;
}

function MapCoordsPassthrough(props: {
  setMapCoords: (coord: [number, number, number]) => void;
}) {
  const map = useMap();
  const { setMapCoords } = props;

  const onMove = useCallback(() => {
    const center = map.getCenter();
    setMapCoords([center.lat, center.lng, map.getZoom()]);
  }, [map, setMapCoords]);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);

  return null;
}

export default function MapQuestionAnswers(props: MapQuestionEditorProps) {
  const { q, modify, setMapCoords } = props;
  const [addState, setAddState] = useState<AddState | null>(null);
  const handleClick = useCallback(
    (lat: number, lng: number) => {
      if (!addState) {
        return;
      }
      switch (addState.t) {
        case "pin":
          modify({
            ...q,
            correct: {
              ...q.correct,
              representativeAnswers: q.correct.representativeAnswers.concat([
                [lat, lng],
              ]),
            },
          });
          setAddState(null);
          return;
        case "range center":
          setAddState({ t: "range radius", center: [lat, lng] });
          return;
        case "range radius":
          modify({
            ...q,
            correct: {
              ...q.correct,
              matches: q.correct.matches.concat([
                {
                  center: addState.center,
                  radius: Math.sqrt(
                    Math.pow(addState.center[0] - lat, 2) +
                      Math.pow(addState.center[1] - lng, 2),
                  ),
                },
              ]),
            },
          });
          setAddState(null);
          return;
      }
    },
    [addState, modify, q],
  );
  return (
    <>
      <p>
        <button
          className="bigbtn"
          disabled={addState !== null}
          onClick={() => {
            setAddState({ t: "pin" });
          }}
        >
          Add Sample Answer Pin
        </button>
        <button
          className="bigbtn"
          disabled={addState !== null}
          onClick={() => {
            setAddState({ t: "range center" });
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
        <MapClickPassthrough onClick={handleClick} />
        <MapCoordsPassthrough setMapCoords={setMapCoords} />
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
              <button
                className="bigbtn popupBtn"
                onClick={() => {
                  modify({
                    ...q,
                    correct: {
                      ...q.correct,
                      matches: q.correct.matches.filter(
                        (candidate) =>
                          candidate.radius !== match.radius ||
                          candidate.center !== match.center,
                      ),
                    },
                  });
                }}
              >
                Delete This Range
              </button>
            </Popup>
          </Circle>
        ))}
        {q.correct.representativeAnswers.map((answer) => (
          <Marker position={answer} key={`${answer[0]}-${answer[1]}`}>
            <Popup>
              <button
                style={{ position: "relative", zIndex: 2 }}
                className="bigbtn"
                onClick={() => {
                  modify({
                    ...q,
                    correct: {
                      ...q.correct,
                      representativeAnswers:
                        q.correct.representativeAnswers.filter(
                          (candidate) =>
                            candidate[0] !== answer[0] ||
                            candidate[1] !== answer[1],
                        ),
                    },
                  });
                }}
              >
                Delete This Pin
              </button>
            </Popup>
          </Marker>
        ))}
        {addState && addState.t === "range radius" ? (
          <Marker position={addState.center} icon={redIcon} />
        ) : null}
      </MapContainer>
    </>
  );
}
