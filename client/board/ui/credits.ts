import Dom from "../../dom.js";

export default class CreditsUi {
  constructor(parent: HTMLElement) {
    const wrapOuter = Dom.div(undefined, "credits card");

    const wrap = Dom.div(Dom.h1("KaXing"), "scroll");
    wrapOuter.appendChild(wrap);

    wrap.appendChild(Dom.p("Created by", "title"));
    wrap.appendChild(Dom.p("Michael Xing", "main"));

    wrap.appendChild(Dom.p("Inspired by", "title"));
    wrap.appendChild(Dom.p("Kahoot", "main"));

    wrap.appendChild(Dom.p("Special Thanks", "title"));
    wrap.appendChild(
      Dom.p(
        "Everyone who helped test my game, including the students of:",
        "smallMain",
      ),
    );
    wrap.appendChild(Dom.p("- CS 2112 Fall 2024", "main sub"));
    wrap.appendChild(Dom.p("- CS 2110 Spring 2025", "main sub"));
    wrap.appendChild(Dom.p("(DIS 206 and DIS 212)", "main sub"));

    wrap.appendChild(Dom.p("Additional Special Thanks", "title"));
    wrap.appendChild(Dom.p("Goldman Sachs", "main"));
    wrap.appendChild(
      Dom.p(
        "for buying Kahoot and making it cost money, inspiring me to make this",
        "smallMain",
      ),
    );

    const final = Dom.div(undefined, "final");
    wrap.appendChild(final);
    const title = Dom.p("This is ", "medium");
    title.appendChild(Dom.span("KaXing", "logo"));
    final.appendChild(title);
    const ad = Dom.p("Create your own at ");
    ad.appendChild(Dom.code("michaelxing.com/kaxing"));
    final.appendChild(ad);
    final.appendChild(Dom.p("Proudly open source on GitHub"));
    final.appendChild(Dom.p("Thank you for playing!", "big"));

    Dom.insertEl(wrapOuter, parent).then(() => {
      window.setTimeout(() => {
        wrapOuter.classList.add("show");
      }, 500);
    });
  }
}
