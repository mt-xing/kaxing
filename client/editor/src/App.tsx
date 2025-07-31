import "./App.css";
import StartScreen from "./components/startScreen";

function App() {
  return (
    <>
      <StartScreen startNew={() => {}} loadExisting={console.log} />
    </>
  );
}

export default App;
