import * as io from "socket.io";
import { Player } from "../shared/player.js";
import { Question } from "./question.js";
import { ControllerSuccessResponse, KickPlayerPayload } from "./payloads.js";

export default class Broker {
  #boardSocket: io.Socket;

  #controlSocket?: io.Socket;

  #players: Map<string, { socket: io.Socket } & Player>;

  #questions: Question[];

  /**
   * Create a helper to setup a new game
   */
  constructor(hostPlayerSocket: io.Socket, questions: Question[]) {
    this.#boardSocket = hostPlayerSocket;
    this.#players = new Map();
    this.#questions = questions;
  }

  /**
   * Designate a socket as the controller
   * @returns True iff successful
   */
  addController(socket: io.Socket): boolean {
    if (this.#controlSocket) {
      console.error("Controller already present!");
      return false;
    }
    this.#controlSocket = socket;
    const payload: ControllerSuccessResponse = {
      players: [...this.#players.entries()].map((x) => ({
        name: x[1].name,
        id: x[0],
      })),
    };
    socket.emit("controllerClaimYes", JSON.stringify(payload));
    socket.on("kick", (msg: string) => {
      const { id } = JSON.parse(msg) as KickPlayerPayload;
      this.removePlayer(id);
    });
    return true;
  }

  /**
   * Add a player to the game
   * @returns Whether joining was successful or not
   */
  addPlayer(socket: io.Socket, name: string, id: string): boolean {
    if (this.#players.has(id)) {
      return false;
    }

    this.#players.set(id, { socket, name, score: 0, answers: [], record: [] });
    this.#boardSocket.emit("join", JSON.stringify({ id, name }));
    this.#controlSocket?.emit("join", JSON.stringify({ id, name }));
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
      player.socket.emit(
        "kick",
        JSON.stringify({ reason: "You have been removed from the game" }),
      );
      player.socket.disconnect();
      this.#controlSocket?.emit("kickYes", JSON.stringify({ id }));
    }
  }

  get board() {
    return this.#boardSocket;
  }

  get controller() {
    return this.#controlSocket;
  }

  get players() {
    return this.#players;
  }

  get questions() {
    return this.#questions;
  }
}
