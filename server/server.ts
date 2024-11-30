import * as io from "socket.io";
import crypto from "crypto";
import KaXingGame from "./game.js";
import Broker from "./broker.js";
import {
  ControllerJoinResponse,
  ErrorResponse,
  JoinRoomPayload,
} from "../shared/payloads.js";
import { Answer } from "../shared/question.js";

export default class KaXingServer {
  #namespace: io.Namespace;

  /**
   * Socket ID to room ID
   */
  #socketRoom: Map<string, string>;

  #pendingControllers: Map<string, io.Socket>;

  #games: Map<string, KaXingGame>;

  #setups: Map<string, Broker>;

  /**
   * Create a new server for onuw
   * @param {io.Namespace} namespace A socket.io namespace for the game to operate on
   */
  constructor(namespace: io.Namespace) {
    this.#namespace = namespace;
    this.#socketRoom = new Map();
    this.#pendingControllers = new Map();
    this.#games = new Map();
    this.#setups = new Map();

    namespace.on("connection", (socket) => {
      socket.on("createRoom", this.#createRoom.bind(this, socket));
      socket.on("controller", this.#controllerJoin.bind(this, socket));
      socket.on("controllerClaim", this.#controllerClaim.bind(this, socket));
      socket.on("openGame", this.#openGame.bind(this, socket));
      socket.on("join", this.#joinRoom.bind(this, socket));

      socket.on("start", this.#startGame.bind(this, socket));

      socket.on("gameState", this.#handleControllerCmd.bind(this, socket));
      socket.on("response", this.#handleResponse.bind(this, socket));

      // socket.on("disconnect", this.#endGame.bind(this, socket));
    });
  }

  /**
   * Attempt to create a new room
   */
  #createRoom(socket: io.Socket, gameInfo: string, callback: () => void) {
    callback();
    const getID = () => Math.random().toString(36).substring(2, 7);
    let remainingTries = 50;
    while (remainingTries > 0) {
      const id = getID();
      if (!this.#games.has(id) && !this.#setups.has(id)) {
        socket.join(id);
        this.#setups.set(id, new Broker(socket, JSON.parse(gameInfo)));
        this.#socketRoom.set(socket.id, id);

        socket.emit("createYes", JSON.stringify({ id }));

        return;
      }
      remainingTries--;
    }
    socket.emit(
      "createNo",
      JSON.stringify({
        reason:
          "Unable to assign a room ID. The server may be suffering from congestion at the moment. Please try again later.",
      }),
    );
  }

  #controllerJoin(socket: io.Socket, _value: string, callback: () => void) {
    callback();
    const getPwd = () => Math.random().toString().substring(3, 9);
    let remainingTries = 50;
    while (remainingTries > 0) {
      const password = getPwd();
      if (!this.#pendingControllers.has(password)) {
        this.#pendingControllers.set(password, socket);

        const payload: ControllerJoinResponse = { password };
        socket.emit("controllerYes", JSON.stringify(payload));

        return;
      }
      remainingTries--;
    }
    const errorPayload: ErrorResponse = {
      reason:
        "Unable to assign a password. The server may be suffering from congestion at the moment. Please try again later.",
    };
    socket.emit("controllerNo", JSON.stringify(errorPayload));
  }

  #controllerClaim(socket: io.Socket, payload: string, callback: () => void) {
    callback();
    const { password } = JSON.parse(payload) as ControllerJoinResponse;
    const controller = this.#pendingControllers.get(password);
    const room = this.#socketRoom.get(socket.id);
    const broker = this.#setups.get(room ?? "");
    if (controller && broker && room) {
      controller.join(room);
      broker.addController(controller);
      this.#pendingControllers.delete(password);
      socket.emit("controllerClaimYes");
      this.#socketRoom.set(controller.id, room);
    } else {
      const errorPayload: ErrorResponse = {
        reason: "Invalid password",
      };
      socket.emit("controllerClaimNo", JSON.stringify(errorPayload));
    }
  }

  /**
   * Allow players to begin joining a game
   */
  #openGame(socket: io.Socket) {
    const room = this.#socketRoom.get(socket.id);
    const game = this.#setups.get(room ?? "");
    if (
      game === undefined ||
      room === undefined ||
      socket !== game.controller
    ) {
      return;
    }
    game.board.emit("openGame");
  }

  /**
   * Join an existing room being setup
   */
  #joinRoom(socket: io.Socket, roomInfo: string, callback: () => void) {
    callback();
    const { id, name } = JSON.parse(roomInfo) as JoinRoomPayload;
    const game = this.#setups.get(id);
    if (game === undefined) {
      const errorPayload: ErrorResponse = {
        reason: "This game code does not exist",
      };
      socket.emit("joinNo", JSON.stringify(errorPayload));
      return;
    }
    const guid = crypto.randomUUID();
    const addResult = game.addPlayer(socket, name, guid);
    if (!addResult) {
      socket.emit(
        "joinNo",
        JSON.stringify({
          reason: "This game is no longer accepting more players",
        }),
      );
    } else {
      socket.emit("joinYes");
      socket.join(id);
      this.#socketRoom.set(socket.id, id);
    }
  }

  /**
   * @param {io.Socket} socket
   */
  #startGame(socket: io.Socket, _value: string, callback: () => void) {
    callback();
    const room = this.#socketRoom.get(socket.id);
    const game = this.#setups.get(room ?? "");
    if (
      game === undefined ||
      room === undefined ||
      socket !== game.controller
    ) {
      return;
    }

    const newGame = new KaXingGame(
      game.questions,
      game.board,
      game.controller,
      game.players,
    );
    game.controller.removeAllListeners("kick");
    this.#games.set(room, newGame);
    this.#setups.delete(room);

    this.#namespace.to(room).emit("start");
  }

  #handleControllerCmd(socket: io.Socket, value: string, callback: () => void) {
    callback();
    const room = this.#socketRoom.get(socket.id);
    const game = this.#games.get(room ?? "");
    if (!room || !game) {
      return;
    }
    game.handleControllerRequest(socket, value);
  }

  #handleResponse(socket: io.Socket, value: string, callback: () => void) {
    callback();
    const room = this.#socketRoom.get(socket.id);
    const game = this.#games.get(room ?? "");
    if (!room || !game) {
      return;
    }
    game.receiveResponse(socket, JSON.parse(value) as Answer);
  }
}
