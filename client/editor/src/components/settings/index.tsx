import { useState } from "react";
import "./Settings.css";

export type SettingsProps = {
  startName: string;
  startAuthor: string;
  startAddlQuestions?: string[];
  close: (name: string, author: string, additionalQuestions?: string[]) => void;
};

export default function Settings(props: SettingsProps) {
  const { close, startName, startAuthor, startAddlQuestions } = props;
  const [name, setName] = useState(startName);
  const [author, setAuthor] = useState(startAuthor);
  const [addlQuestions, setAddlQuestions] = useState(startAddlQuestions);
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
          onClick={() =>
            close(
              name,
              author,
              addlQuestions !== undefined && addlQuestions.length > 0
                ? addlQuestions
                : undefined,
            )
          }
        >
          Save
        </button>
      </p>
    </div>
  );
}
