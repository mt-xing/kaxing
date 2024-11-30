import * as io from "socket.io";
import { Question } from "../shared/question.js";
import { Player } from "../shared/player.js";
import Communicator from "./comms.js";

export default class KaXingGame {
  #questions: Question[];

  #board: io.Socket;

  #controller: io.Socket;

  #players: Map<string, { socket: io.Socket } & Player>;

  #comms: Communicator;

  constructor(
    questions: Question[],
    board: io.Socket,
    controller: io.Socket,
    players: Map<string, { socket: io.Socket } & Player>,
  ) {
    this.#questions = questions;
    this.#board = board;
    this.#controller = controller;
    this.#players = players;
    this.#comms = new Communicator(board, controller, players);
  }
}
