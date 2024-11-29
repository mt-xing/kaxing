// import Home from "./ui/home.js";
import StandardQuestionBoard from "./ui/questions/standard.js";

window.onload = () => {
  // new Home(document.body, "fjiw8");
  // @ts-ignore
  window.testBoard = new StandardQuestionBoard(
    document.body,
    {
      t: "standard",
      points: 100,
      time: 20,
      text: "Which of the following members of course staff did not lead at least one lab or discussion this semester?",
      correct: 3,
      answers: ["James Zhang", "Sean Zhang", "Jonathan Gabor", "Jonah Huang"],
    },
    50,
  );
};
