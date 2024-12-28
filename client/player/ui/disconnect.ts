import Dom from "../../dom.js";

let state:
  | undefined
  | {
      t: "disconn";
      el: HTMLElement;
    }
  | {
      t: "reconn";
      el: HTMLElement;
      timeout: ReturnType<typeof setTimeout>;
      nonce: number;
    };

function hideElement(el: HTMLElement) {
  el.classList.remove("show");
  setTimeout(() => {
    el.parentElement?.removeChild(el);
  }, 500);
}

function clearMsg() {
  if (state) {
    hideElement(state.el);
    if (state.t === "reconn") {
      clearTimeout(state.timeout);
    }
  }
}

export function showDisconnect() {
  clearMsg();
  const wrap = Dom.div(undefined, "disconnectMsg");
  wrap.appendChild(Dom.h1("⚠️ Reconnecting"));
  wrap.appendChild(Dom.p("This device seems to have been disconnected :("));
  wrap.appendChild(
    Dom.p("Hang on while we try to get you back into the game..."),
  );

  state = {
    t: "disconn",
    el: wrap,
  };
  Dom.insertEl(wrap, document.body).then(() => {
    wrap.classList.add("show");
  });
}

export function showReconnect() {
  if (state === undefined) {
    return;
  }
  clearMsg();
  const wrap = Dom.div(undefined, "disconnectMsg done");
  wrap.appendChild(Dom.h1("✅ We Are So Back"));
  wrap.appendChild(Dom.p("You'll rejoin the game with the next question."));

  const nonce = Math.random();

  state = {
    t: "reconn",
    el: wrap,
    nonce,
    timeout: setTimeout(() => {
      if (state?.t === "reconn" && state.nonce === nonce) {
        clearMsg();
        state = undefined;
      }
    }, 5000),
  };
  Dom.insertEl(wrap, document.body).then(() => {
    wrap.classList.add("show");
  });
}
