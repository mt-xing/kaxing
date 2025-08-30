import Dom from "../../dom.js";
import { KaXingSaveFile } from "../../fileFormat.js";

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

async function verifyFile(file: File): Promise<KaXingSaveFile | undefined> {
  const text = await readSelectedFile(file);
  try {
    const saveFile: KaXingSaveFile = JSON.parse(text);
    const { title, questions } = saveFile;
    if (!Array.isArray(questions)) {
      return undefined;
    }
    if (!title) {
      return undefined;
    }
    return saveFile;
  } catch (e) {
    console.warn("Failed to parse", e);
    return undefined;
  }
}

export default class UploadQuestions {
  #wrap: HTMLElement;

  constructor(parent: HTMLElement, gotFile: (game: KaXingSaveFile) => void) {
    const wrap = Dom.div(undefined, "controllerWrap");
    wrap.appendChild(Dom.h2("Choose Questions"));
    wrap.appendChild(Dom.p("Upload your question bank for this game"));
    const label = document.createElement("LABEL");
    label.classList.add("fileUpload");
    label.textContent = "Drop File Here or Click to Select";
    const input = Dom.input("file");
    input.accept = ".kaxing";
    label.appendChild(input);
    wrap.appendChild(label);

    label.ondragover = (evt) => {
      evt.preventDefault();
    };
    label.ondragenter = (evt) => {
      evt.preventDefault();
      label.classList.add("hovering");
    };
    label.ondragleave = () => {
      label.classList.remove("hovering");
    };
    label.ondrop = (evt) => {
      if (!evt.dataTransfer) {
        return;
      }
      evt.preventDefault();
      input.files = evt.dataTransfer.files;
      const { files } = input;
      if (files && files.length > 0) {
        verifyFile(files[0]).then((x) => {
          if (x) {
            label.textContent = x.title;
          }
        });
      } else {
        label.textContent = "Drop File Here or Click to Select";
      }
      label.classList.remove("hovering");
    };
    label.onclick = (evt) => {
      evt.preventDefault();
      input.value = null as unknown as string;
      label.textContent = "Drop File Here or Click to Select";
      input.click();
    };

    input.onchange = (evt) => {
      const files = (evt.target as HTMLInputElement | null)?.files;
      console.log("File changed", files);
      if (files && files.length > 0) {
        verifyFile(files[0]).then((x) => {
          if (x) {
            label.textContent = x.title;
          }
        });
      } else {
        label.textContent = "Drop File Here or Click to Select";
      }
    };

    const btn = Dom.button(
      "Upload",
      async (e) => {
        e.preventDefault();
        const fileList = input.files;
        if (!fileList || fileList.length < 1) {
          return;
        }
        btn.disabled = true;
        const result = await verifyFile(fileList[0]);
        if (result) {
          gotFile(result);
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
