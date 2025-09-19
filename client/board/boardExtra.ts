import mainGameLoop from "./gameFlow/gameBoard.js";

const socket = (() => {
  const map = new Map();
  window.addEventListener("message", (event) => {
    const { type, msg } = event.data;
    if (type === "sideScreenStartup") {
      const { questions, code } = msg;
      mainGameLoop(socket, questions, code, true);
      return;
    }
    map.get(type)?.(msg);
  });

  return {
    on: (type: string, callback: (msg: string) => void) => {
      map.set(type, callback);
    },
    off: (type: string) => {
      map.delete(type);
    },
  };
})();

window.onload = () => {
  try {
    navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err);
  }
  if (window.opener) {
    window.opener.postMessage("sideScreenReady");
  }
};
