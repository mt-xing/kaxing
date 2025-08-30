import Dom from "../../dom.js";

export default class JoinQuestions {
  #wrap: HTMLElement;

  #responses: HTMLInputElement[];

  constructor(
    parent: HTMLElement,
    questions: string[],
    connect: (responses: string[]) => Promise<boolean>,
  ) {
    const wrap = document.createElement("FORM");
    wrap.classList.add("joinQuestionsWrap");
    wrap.classList.add("center");
    this.#responses = [];

    questions.forEach((question) => {
      const q = Dom.p(question);
      const r = Dom.input("text");
      r.required = true;
      r.placeholder = "<Response here>";
      this.#responses.push(r);
      wrap.appendChild(q);
      wrap.appendChild(Dom.div(r));
    });

    const goBtn = Dom.button(
      "Submit",
      async (e) => {
        e.preventDefault();
        if (this.#responses.some((x) => !x.value)) {
          return;
        }
        goBtn.disabled = true;
        const result = await connect(this.#responses.map((x) => x.value));
        if (result) {
          this.remove();
        } else {
          // eslint-disable-next-line no-alert
          alert("Something has gone wrong. Please try again later :(");
        }
      },
      "bigbtn",
    );

    wrap.appendChild(goBtn);

    this.#wrap = Dom.outerwrap(wrap);
    Dom.insertEl(this.#wrap, parent).then(() => {
      wrap.style.transform = "translateY(0)";
    });
  }

  async remove() {
    await Dom.deleteOuterwrap(this.#wrap);
  }
}
