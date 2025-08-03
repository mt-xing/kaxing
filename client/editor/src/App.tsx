import { useCallback, useEffect, useState } from "react";
import "./App.css";
import StartScreen from "./components/startScreen";
import type { Question } from "@shared/question";
import type { KaXingSaveFile } from "@shared/fileFormat";
import { downloadFile } from "./utils/upload";
import QuestionCarousel from "./components/questionCarousel";
import QuestionEditor from "./components/questions";

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
    const blankQuestion: Question = {
      t: "standard",
      text: "",
      time: 20,
      points: 1000,
      answers: ["", "", "", ""],
      correct: 0,
    };
    setQuestions([blankQuestion]);
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
          <QuestionEditor q={questions[selectedQuestion]} />
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
