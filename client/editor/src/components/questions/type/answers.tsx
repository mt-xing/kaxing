import type { Question } from "@shared/question";
import "./type.css";

export type TypeQuestionEditorProps = {
  q: Extract<Question, { t: "type" }>;
  modify: (newQ: Question) => void;
};

export default function TypeQuestionAnswers(props: TypeQuestionEditorProps) {
  const { q, modify } = props;
  return (
    <>
      <p className="regexWrap">
        <label>
          Answer Regex:{" "}
          <code>
            /
            <input
              type="text"
              value={q.correct.regex}
              onChange={(evt) =>
                modify({
                  ...q,
                  correct: { ...q.correct, regex: evt.target.value },
                })
              }
              placeholder="<REGEX HERE>"
            />
            /{q.caseInsensitive ? "i" : ""}
          </code>
        </label>
      </p>
      <p className="regexDetails">
        Enter a Regular Expression that answers must match against. I recommend
        using a site like{" "}
        <a
          href="https://regexr.com"
          target="_blank"
          referrerPolicy="no-referrer"
          style={{ color: "white" }}
        >
          regexr.com
        </a>{" "}
        to test your pattern. Use JavaScript mode with all flags disabled
        {q.caseInsensitive ? " except for case insensitive" : ""}. Note any
        match is considered a success, so use <code>^</code> and <code>$</code>{" "}
        if desired. Answers are also trimmed of leading and trailing whitespace
        before matching, and will not contain newlines.
      </p>
      <p>
        Enter one or more sample answers below. These will be shown to players
        as the correct answers.
      </p>
      <ul className="repAnswers">
        {q.correct.representativeAnswers.map((x, i) => (
          <li key={i}>
            <button
              className="bigbtn"
              disabled={q.correct.representativeAnswers.length <= 1}
              onClick={() => {
                modify({
                  ...q,
                  correct: {
                    ...q.correct,
                    representativeAnswers:
                      q.correct.representativeAnswers.filter(
                        (_x, ii) => ii !== i,
                      ),
                  },
                });
              }}
            >
              X
            </button>
            <input
              type="text"
              value={x}
              onChange={(evt) => {
                modify({
                  ...q,
                  correct: {
                    ...q.correct,
                    representativeAnswers: q.correct.representativeAnswers.map(
                      (xx, ii) => (ii !== i ? xx : evt.target.value),
                    ),
                  },
                });
              }}
            />
          </li>
        ))}
      </ul>
      <button
        className="bigbtn"
        onClick={() => {
          modify({
            ...q,
            correct: {
              ...q.correct,
              representativeAnswers: q.correct.representativeAnswers.concat([
                "",
              ]),
            },
          });
        }}
      >
        Add More
      </button>
    </>
  );
}
