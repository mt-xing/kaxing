import * as io from "socket.io";

export default class Communicator {
  #board: io.Socket;

  #controller: io.Socket;

  #players: Map<string, { socket: io.Socket }>;

  #socketToPlayer: Map<string, string>;

  constructor(
    board: io.Socket,
    controller: io.Socket,
    players: Map<string, { socket: io.Socket }>,
  ) {
    this.#board = board;
    this.#controller = controller;
    this.#players = players;
    this.#socketToPlayer = new Map();
    players.forEach(({ socket }, id) =>
      this.#socketToPlayer.set(socket.id, id),
    );
  }
}
