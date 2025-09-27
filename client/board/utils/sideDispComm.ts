import { KaXingSaveFile } from "../../fileFormat";

let extraWindow: Window | null = null;

export function spawnWindow(questions: KaXingSaveFile, code: string) {
  if (extraWindow) {
    return;
  }

  window.addEventListener("message", (event) => {
    if (event.data === "sideScreenReady") {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      postToWindow("sideScreenStartup", { questions, code });
    }
  });

  extraWindow = window.open(
    "extra.html",
    "KaXing Display",
    "height=600,width=800",
  );
  return extraWindow;
}

export function postToWindow(type: string, msg: unknown) {
  extraWindow?.postMessage({ type, msg });
}
