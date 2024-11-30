import Dom from "../../dom.js";

async function readSelectedFile(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    // Set up event handlers
    reader.onload = (event) => {
      if (event.target) {
        if (typeof event.target.result === "string") {
          resolve(event.target.result);
        } else if (event.target.result === null) {
          reject();
        } else {
          const decoder = new TextDecoder("utf-8");
          resolve(decoder.decode(event.target.result));
        }
      } else {
        reject();
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
}

export default class UploadQuestions {
  #wrap: HTMLElement;

  constructor(
    parent: HTMLElement,
    gotFile: (text: string) => Promise<boolean>,
  ) {
    const wrap = Dom.div(undefined, "controllerWrap");
    wrap.appendChild(Dom.h2("Choose Questions"));
    wrap.appendChild(Dom.p("Upload your question bank for this game"));
    const input = Dom.input("file");
    input.accept = ".json";
    wrap.appendChild(input);
    const btn = Dom.button(
      "Upload",
      async (e) => {
        e.preventDefault();
        const fileList = input.files;
        if (!fileList || fileList.length < 1) {
          return;
        }
        btn.disabled = true;
        const text = await readSelectedFile(fileList[0]);
        const result = await gotFile(text);
        if (result) {
          this.remove();
        } else {
          // eslint-disable-next-line no-alert
          alert("That didn't work");
          btn.disabled = false;
          input.focus();
        }
      },
      "bigbtn",
    );
    wrap.appendChild(btn);

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
