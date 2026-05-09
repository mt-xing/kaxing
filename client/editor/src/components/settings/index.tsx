import { useState } from "react";
import "./Settings.css";
import type { KaXingSaveFile } from "@shared/fileFormat";

export type SettingsProps = {
  startName: string;
  startAuthor: string;
  startAddlQuestions?: string[];
  startMusic: KaXingSaveFile["music"];
  close: (name: string, author: string, music: KaXingSaveFile["music"], additionalQuestions?: string[]) => void;
};

export default function Settings(props: SettingsProps) {
  const { close, startName, startAuthor, startAddlQuestions, startMusic } = props;
  const [name, setName] = useState(startName);
  const [author, setAuthor] = useState(startAuthor);
  const [addlQuestions, setAddlQuestions] = useState(startAddlQuestions);
  const [music, setMusic] = useState(startMusic);
  return (
    <div className="settingsWrap">
      <h1>Settings</h1>
      <h2>Basic Setup</h2>
      <p>
        <label>
          Game Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="KaXing Game"
          />
        </label>
      </p>
      <p>
        <label>
          Game Author:
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Unknown"
          />
        </label>
      </p>
      <details>
        <summary>Advanced Settings</summary>
      
        <h2>Music</h2>
        <p>
          <label>
            Use Music:{" "}
            <input
              type="checkbox"
              checked={music !== undefined}
              onChange={(e) => {
                const checked = e.target.checked;
                if (!checked) {
                  if (
                    !confirm(
                      "This will delete all current music. Are you sure you wish to continue?",
                    )
                  ) {
                    return;
                  }
                  setMusic(undefined);
                  return;
                }
                setMusic({q: {}});
              }}
            />
          </label>
        </p>
        {
          music !== undefined ? <>
            <p>Music files must be hosted on a publicly accessible server in a web-compatible format like MP3.</p>
            <p><label>Main Theme Song (looped): <input type="text" value={music.theme ?? ""} onChange={(e) => setMusic((m) => {
              if (!m) {return m;}
              const mm: KaXingSaveFile["music"] = {...m, theme: e.target.value || undefined};
              return mm;
            })} /></label></p>
            <p><label>Podium Music: <input type="text" value={music.gg ?? ""} onChange={(e) => setMusic((m) => {
              if (!m) {return m;}
              const mm: KaXingSaveFile["music"] = {...m, gg: e.target.value || undefined};
              return mm;
            })} /></label></p>
            <p><label>Time's Up Sound Effect: <input type="text" value={music.end ?? ""} onChange={(e) => setMusic((m) => {
              if (!m) {return m;}
              const mm: KaXingSaveFile["music"] = {...m, end: e.target.value || undefined};
              return mm;
            })} /></label></p>
            <p>Question timing specific music tracks:</p>
            <ul>
              {Object.keys(music.q).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((time) => (
                <li key={time}>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="999"
                    defaultValue={time}
                    onBlur={(e) => {
                      const newTime = parseInt(e.target.value, 10);
                      if (Number.isNaN(newTime) || newTime <= 0) { return; }
                      setMusic((m) => {
                        if (m === undefined) {
                          return undefined;
                        }
                        if (!m.q[time]) {
                          return m;
                        }
                        if (m.q[newTime]) {
                          return m;
                        }
                        const mm: KaXingSaveFile["music"] = {...m, q: {...m.q, [newTime]: [...m.q[time]]}};
                        delete mm.q[time];
                        return mm;
                      });
                    }}
                    placeholder="20"
                    style={{minWidth: "3em", width: "3em", padding: "12px 16px", marginRight: "1em", fontSize: "16px"}}
                  /> sec music tracks:
                  <ul>
                    {music.q[time].map((track, i) => 
                      <li key={i}>
                        <input type="text" value={track} placeholder="URL" onChange={(e) =>
                          setMusic((m) => {
                            if (m === undefined) {
                              return undefined;
                            }
                            if (!m.q[time]) {
                              return m;
                            }
                            const mm = {...m, q: {...m.q, [time]: [...m.q[time]]}};
                            mm.q[time][i] = e.target.value;
                            if (!e.target.value) {
                              mm.q[time] = mm.q[time].slice(0, i).concat(mm.q[time].slice(i + 1));
                              if (i === mm.q[time].length) {
                                setTimeout(() => {
                                  document.getElementById(`addUrlTime${time}`)?.focus();
                                }, 0);
                              }
                            }
                            return mm;
                          })}
                        />
                      </li>
                    )}
                    <li key={music.q[time].length}>
                      <input type="text" value="" placeholder="Add another track" onChange={(e) =>
                        setMusic((m) => {
                          if (m === undefined) {
                            return undefined;
                          }
                          if (!m.q[time]) {
                            return m;
                          }
                          const mm = {...m, q: {...m.q}};
                          mm.q[time] = [...m.q[time], e.target.value];
                          return mm;
                        })}
                        id={`addUrlTime${time}`}
                      />
                    </li>
                    <li key="delete" style={{marginBottom: "1em"}}>
                      <button className="bigbtn" onClick={() => {
                        if (!confirm("Are you sure you want to delete this timing category?")) {return;}
                        setMusic((m) => {
                        if (m === undefined) {
                          return undefined;
                        }
                        if (!m.q[time]) {
                          return m;
                        }
                        const mm: KaXingSaveFile["music"] = {...m, q: {...m.q}};
                        delete mm.q[time];
                        return mm;
                      });
                      }}>Delete {time} sec Category</button>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
            <p>
              <button className="bigbtn" onClick={(_) => setMusic((m) => {
                        if (m === undefined) {
                          return undefined;
                        }
                        if (m.q[999]) {
                          return m;
                        }
                        const mm: KaXingSaveFile["music"] = {...m, q: {...m.q, [999]: []}};
                        return mm;
                      })}
              >Add Question Timing Category</button>
            </p>
          </> : undefined
        }
        
        <h2>Additional Questions</h2>
        <p>
          You can require players to provide text answers to additional questions
          before joining the game (for example, a student ID to associate
          responses with a student later). These answers will not be shown on the
          board and are only visible in the downloaded game summary.
        </p>
        <p>
          <label>
            Require Additional Questions:{" "}
            <input
              type="checkbox"
              checked={addlQuestions !== undefined}
              onChange={(e) => {
                const checked = e.target.checked;
                if (!checked) {
                  if (
                    !confirm(
                      "This will delete all current questions. Are you sure you wish to continue?",
                    )
                  ) {
                    return;
                  }
                  setAddlQuestions(undefined);
                  return;
                }
                setAddlQuestions([]);
              }}
            />
          </label>
        </p>
        {addlQuestions === undefined ? null : (
          <>
            <ul>
              {addlQuestions.map((q, i) => (
                <li key={i}>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) =>
                      setAddlQuestions((a) => {
                        if (a === undefined) {
                          return undefined;
                        }
                        const aa = a.slice();
                        aa[i] = e.target.value;
                        return aa;
                      })
                    }
                    placeholder="Question Text"
                  />
                  <button
                    className="bigbtn"
                    onClick={() =>
                      setAddlQuestions((q) =>
                        q === undefined ? q : q.filter((_, ii) => ii !== i),
                      )
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="bigbtn"
              onClick={() =>
                setAddlQuestions((a) =>
                  a === undefined ? undefined : a.concat(""),
                )
              }
            >
              Add Question
            </button>
          </>
        )}
      </details>
      <p>
        <button
          disabled={!name || !author}
          className="bigbtn"
          onClick={() => {
            const cleanedMusic = music ? {
              theme: music.theme ?? undefined,
              gg: music.gg ?? undefined,
              end: music.end ?? undefined,
              q: Object.keys(music.q).reduce((a, x) => (music.q[x].filter(x => !!x).length > 0 ? {
                ...a,
                [x]: music.q[x].filter(x => !!x)
              } : a), {}),
            } : undefined;
            close(
              name,
              author,
              cleanedMusic,
              addlQuestions !== undefined && addlQuestions.length > 0
                ? addlQuestions
                : undefined,
            );
            }
          }
        >
          Save
        </button>
      </p>
    </div>
  );
}
