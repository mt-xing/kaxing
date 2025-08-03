import type { Question } from "@shared/question";
import "./type.css";

export type TypeQuestionEditorProps = {
  q: Extract<Question, { t: "type" }>;
  modify: (newQ: Question) => void;
};

export default function TypeQuestionSidebar(props: TypeQuestionEditorProps) {
  const { q, modify } = props;
  return (
    <>
      <p>
        <label>
          <input
            type="checkbox"
            checked={q.caseInsensitive}
            onChange={(evt) =>
              modify({ ...q, caseInsensitive: evt.target.checked })
            }
          />
          Case Insensitive
        </label>
      </p>
    </>
  );
}
