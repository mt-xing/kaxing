import { showDisconnect, showReconnect } from "./ui/disconnect.js";

declare const io: (
  url: string,
  options: Record<string, unknown>,
) => {
  on: (event: string, callback: (x: never) => void) => void;
  off: (event: string) => void;
  emit: (type: string, msg: string) => void;
  id: string;
  io: {
    engine: { on: (event: string, callback: (x: never) => void) => void };
  };
};

export default class Socket {
  #socket;

  /**
   * Construct a new socket.io connection
   */
  constructor(url: string) {
    this.#socket = io(url, {
      ackTimeout: 2000,
      retries: 3,
      closeOnBeforeunload: false,
    });
    this.#socket.on("connect", () => {
      console.debug(`Socket connected; id: ${this.#socket.id}`);
      showReconnect();
    });
    this.#socket.on("disconnect", (reason) => {
      if (
        reason !== "io server disconnect" &&
        reason !== "io client disconnect"
      ) {
        showDisconnect();
      }
    });
    this.#socket.io.engine.on("packet", (packet: unknown) => {
      if (
        typeof packet === "object" &&
        packet &&
        "type" in packet &&
        packet.type === "message"
      ) {
        console.debug(packet);
      }
    });
  }

  /**
   * Register a callback
   */
  on(type: string, callback: (msg: string) => void) {
    this.#socket.on(type, callback);
  }

  /**
   * Clear a callback
   */
  off(type: string) {
    this.#socket.off(type);
  }

  /**
   * Send a message to the server
   */
  emit(type: string, msg: string) {
    console.debug(`Sending data type "${type}" message: ${msg}`);
    this.#socket.emit(type, msg);
  }

  send(type: string, msg: Record<string, unknown>) {
    this.emit(type, JSON.stringify(msg));
  }
}
