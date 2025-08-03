import type { Question } from "@shared/question";

export type StandardQuestionSidebarProps = {
  q: Extract<Question, { t: "standard" }>;
  modify: (newQ: Question) => void;
};

export default function StandardQuestionSidebar(
  props: StandardQuestionSidebarProps,
) {
  const { q, modify } = props;

  return (
    <>
      <p>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => {
              if (evt.target.checked) {
                if (typeof q.correct === "number") {
                  modify({ ...q, correct: [q.correct] });
                }
              } else {
                if (Array.isArray(q.correct)) {
                  modify({
                    ...q,
                    correct: q.correct.length > 0 ? q.correct[0] : 0,
                  });
                }
              }
            }}
          />
          Multiple Correct Answers
        </label>
      </p>
      {Array.isArray(q.correct) && q.correct.length <= 0 ? (
        <p className="warning">WARNING: This question has no correct answer</p>
      ) : null}
      {Array.isArray(q.correct) ? (
        <p>
          Players get credit for selecting any one correct answer. If you want
          to require all correct answers be chosen, use the "Multi-Select"
          question type (not yet implemented; coming eventually)
        </p>
      ) : null}
    </>
  );
}
