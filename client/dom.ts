/**
 * Static helper methods to manipulate the DOM
 */
export default class Dom {
  static async insertEl(el: HTMLElement, parent: HTMLElement): Promise<void> {
    parent.appendChild(el);
    return new Promise((r) => {
      requestAnimationFrame(() => setTimeout(r));
    });
  }

  static outerwrap(child?: HTMLElement): HTMLElement {
    return this.div(child, "outerwrap");
  }

  static async deleteOuterwrap(wrap: HTMLElement): Promise<void> {
    return new Promise((r) => {
      wrap.classList.add("out");
      setTimeout(() => {
        wrap.parentElement?.removeChild(wrap);
        r();
      }, 750);
    });
  }

  /**
   * Construct a button DOM object
   */
  static button(
    child: string | HTMLElement,
    callback?: (ev: MouseEvent) => void,
    className?: string,
  ): HTMLButtonElement {
    const d = document.createElement("button");
    if (callback !== undefined) {
      d.onclick = callback;
    }
    if (typeof child === "string") {
      d.textContent = child;
    } else if (child !== undefined) {
      d.appendChild(child);
    }
    if (className !== undefined) {
      d.className = className;
    }
    return d;
  }

  /**
   * Construct a paragraph DOM object
   */
  static p(text: string, className?: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.textContent = text;
    if (className !== undefined) {
      p.className = className;
    }
    return p;
  }

  /**
   * Construct a paragraph DOM object
   */
  static span(text: string, className?: string): HTMLSpanElement {
    const p = document.createElement("span");
    p.textContent = text;
    if (className !== undefined) {
      p.className = className;
    }
    return p;
  }

  /**
   * Construct an HTML div element
   */
  static div(child?: string | HTMLElement, className?: string): HTMLElement {
    const sec = document.createElement("div");

    if (typeof child === "string") {
      sec.appendChild(Dom.span(child));
    } else if (child !== undefined) {
      sec.appendChild(child);
    }
    if (className !== undefined) {
      sec.className = className;
    }

    return sec;
  }

  /**
   * Construct an HTML section element
   */
  static section(child: string | HTMLElement, className?: string): HTMLElement {
    const sec = document.createElement("section");

    if (typeof child === "string") {
      sec.appendChild(Dom.span(child));
    } else {
      sec.appendChild(child);
    }
    if (className !== undefined) {
      sec.className = className;
    }

    return sec;
  }

  /**
   * Construct an HTML LI element
   */
  static li(child: string | HTMLElement): HTMLLIElement {
    const li = document.createElement("li");

    if (typeof child === "string") {
      li.appendChild(Dom.span(child));
    } else {
      li.appendChild(child);
    }

    return li;
  }

  /**
   * Construct an HTML Input element
   */
  static input(
    type: string,
    placeholder?: string,
    defaultValue?: string,
    className?: string,
  ): HTMLInputElement {
    const d = document.createElement("input");
    d.type = type;
    if (placeholder !== undefined) {
      d.placeholder = placeholder;
    }
    if (defaultValue !== undefined) {
      d.defaultValue = defaultValue;
    }
    if (className !== undefined) {
      d.className = className;
    }
    return d;
  }

  static hr() {
    return document.createElement("hr");
  }

  /**
   * Construct an h1 DOM object
   */
  static h1(text: string, className?: string): HTMLHeadingElement {
    const p = document.createElement("h1");
    p.textContent = text;
    if (className !== undefined) {
      p.className = className;
    }
    return p;
  }

  /**
   * Construct an h2 DOM object
   */
  static h2(text: string, className?: string): HTMLHeadingElement {
    const p = document.createElement("h2");
    p.textContent = text;
    if (className !== undefined) {
      p.className = className;
    }
    return p;
  }

  /**
   * Construct an code DOM object
   */
  static code(text: string, className?: string): HTMLElement {
    const p = document.createElement("code");
    p.textContent = text;
    if (className !== undefined) {
      p.className = className;
    }
    return p;
  }
}
