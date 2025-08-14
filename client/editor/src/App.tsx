import { useCallback, useEffect, useState } from "react";
import "./App.css";
import StartScreen from "./components/startScreen";
import type { Question } from "@shared/question";
import type { KaXingSaveFile } from "@shared/fileFormat";
import { downloadFile } from "./utils/upload";
import QuestionCarousel from "./components/questionCarousel";
import QuestionEditor from "./components/questions";
import { getDefaultQuestion } from "./utils/questions";

function App() {
  const [questions, setQuestions] = useState<Question[] | undefined>(undefined);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [fileHandle, setFileHandle] = useState<
    FileSystemFileHandle | undefined
  >(undefined);

  const loadExisting = useCallback(
    (f: FileSystemFileHandle, game: KaXingSaveFile) => {
      setQuestions(game.questions);
      setFileHandle(f);
    },
    [],
  );

  const newGame = useCallback(() => {
    setQuestions([getDefaultQuestion()]);
  }, []);

  const saveGame = useCallback(() => {
    if (questions === undefined) {
      return;
    }
    const saveFile: KaXingSaveFile = {
      game: "kaxing",
      version: "1.0.0",
      questions,
    };
    if (fileHandle === undefined) {
      downloadFile(saveFile).then((handle) => {
        setFileHandle(handle);
      });
      return;
    }

    fileHandle.createWritable().then((ws) => {
      ws.write(JSON.stringify(saveFile));
      ws.close();
    });
  }, [questions, fileHandle]);

  useEffect(() => {
    const saveHandler = (evt: KeyboardEvent) => {
      if (evt.ctrlKey && evt.key === "s") {
        evt.preventDefault();
        saveGame();
      }
    };
    window.addEventListener("keydown", saveHandler);
    return () => {
      window.removeEventListener("keydown", saveHandler);
    };
  }, [saveGame]);

  const modifySelectedQuestion = useCallback(
    (newQ: Question | ((q: Question) => Question)) => {
      setQuestions((oldQ) => {
        if (oldQ === undefined) {
          return undefined;
        }
        const nq =
          typeof newQ === "function" ? newQ(oldQ[selectedQuestion]) : newQ;
        return oldQ
          .slice(0, selectedQuestion)
          .concat([nq])
          .concat(oldQ.slice(selectedQuestion + 1));
      });
    },
    [selectedQuestion],
  );

  const deleteSelectedQuestion = useCallback(() => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    setQuestions((oldQ) => {
      if (!oldQ || oldQ.length <= 1) {
        return;
      }
      return oldQ.filter((_x, i) => i !== selectedQuestion);
    });
    const l = questions?.length ?? 0;
    setSelectedQuestion((i) => (i >= l - 1 ? l - 2 : i));
  }, [selectedQuestion, questions?.length]);

  return (
    <>
      {questions === undefined ? (
        <StartScreen startNew={newGame} loadExisting={loadExisting} />
      ) : (
        <main className="main">
          <header className="header">
            <span>KaXing</span>
            <button className="bigbtn" onClick={saveGame}>
              Save
            </button>
          </header>
          <QuestionEditor
            q={questions[selectedQuestion]}
            modify={modifySelectedQuestion}
            key={questions[selectedQuestion].t}
            deleteQ={deleteSelectedQuestion}
          />
          <nav className="picker">
            <QuestionCarousel
              questions={questions}
              modifyQuestions={setQuestions}
              selected={selectedQuestion}
              selectQuestion={setSelectedQuestion}
            />
          </nav>
        </main>
      )}
    </>
  );
}

export default App;
