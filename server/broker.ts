import * as io from "socket.io";
import { Player } from "../shared/player.js";
import { Question } from "./question.js";
import { ControllerSuccessResponse, KickPlayerPayload } from "./payloads.js";

export default class Broker {
  #namespace: io.Namespace;

  #gameCode: string;

  #boardSocketId: string;

  #controlSocketId?: string;

  #players: Map<string, Player>;

  #questions: Question[];

  /**
   * Create a helper to setup a new game
   */
  constructor(
    namespace: io.Namespace,
    gameCode: string,
    hostPlayerSocketId: string,
    questions: Question[],
  ) {
    this.#namespace = namespace;
    this.#boardSocketId = hostPlayerSocketId;
    this.#players = new Map();
    this.#questions = questions;
    this.#gameCode = gameCode;
  }

  /**
   * Designate a socket as the controller
   * @returns True iff successful
   */
  addController(socketId: string): boolean {
    if (this.#controlSocketId) {
      console.error("Controller already present!");
      return false;
    }
    this.#controlSocketId = socketId;
    const payload: ControllerSuccessResponse = {
      players: [...this.#players.entries()].map((x) => ({
        name: x[1].name,
        id: x[0],
      })),
      numQuestions: this.#questions.length,
      gameCode: this.#gameCode,
    };
    this.#namespace
      .to(socketId)
      .emit("controllerClaimYes", JSON.stringify(payload));
    this.#namespace.sockets.get(socketId)?.on("kick", (msg: string) => {
      const { id } = JSON.parse(msg) as KickPlayerPayload;
      this.removePlayer(id);
    });
    return true;
  }

  /**
   * Add a player to the game
   * @returns Whether joining was successful or not
   */
  addPlayer(id: string, name: string): boolean {
    if (this.#players.has(id)) {
      return false;
    }

    this.#players.set(id, { name, score: 0, answers: [], record: [] });
    this.#namespace
      .to(this.#boardSocketId)
      .emit("join", JSON.stringify({ id, name }));
    if (this.#controlSocketId) {
      this.#namespace
        .to(this.#controlSocketId)
        .emit("join", JSON.stringify({ id, name }));
    }
    return true;
  }

  /**
   * Kick a player
   * @param id
   */
  removePlayer(id: string) {
    const player = this.#players.get(id);
    if (player) {
      this.#players.delete(id);
      this.#namespace
        .to(id)
        .emit(
          "kick",
          JSON.stringify({ reason: "You have been removed from the game" }),
        );
      this.#namespace.sockets.get(id)?.disconnect();
      if (this.#controlSocketId) {
        this.#namespace
          .to(this.#controlSocketId)
          .emit("kickYes", JSON.stringify({ id }));
      }
    }
  }

  get board() {
    return this.#boardSocketId;
  }

  get controller() {
    return this.#controlSocketId;
  }

  get players() {
    return this.#players;
  }

  get questions() {
    return this.#questions;
  }

  get allDisconnected() {
    const boardSocket = this.#namespace.sockets.get(this.#boardSocketId);
    if (boardSocket?.connected) {
      return false;
    }

    if (this.#controlSocketId) {
      const controlSocket = this.#namespace.sockets.get(this.#controlSocketId);
      if (controlSocket?.connected) {
        return false;
      }
    }

    for (const p of this.#players) {
      const [pid] = p;
      const pSocket = this.#namespace.sockets.get(pid);
      if (pSocket?.connected) {
        return false;
      }
    }

    return true;
  }
}
