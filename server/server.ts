import * as io from "socket.io";
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

  /**
   * Password to controller
   */
  #pendingControllers: Map<string, string>;

  #games: Map<string, KaXingGame>;

  #setups: Map<string, Broker>;

  /**
   * Create a new server for KaXing
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

      socket.on("startGame", this.#startGame.bind(this, socket));

      socket.on("gameState", this.#handleControllerCmd.bind(this, socket));
      socket.on("response", this.#handleResponse.bind(this, socket));

      socket.on("disconnect", this.#cleanupRoomIfNeeded.bind(this, socket));
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
        this.#setups.set(
          id,
          new Broker(this.#namespace, socket.id, JSON.parse(gameInfo)),
        );
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
        this.#pendingControllers.set(password, socket.id);

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
    const controllerId = this.#pendingControllers.get(password);
    const controller = this.#namespace.sockets.get(controllerId ?? "ERROR");
    const room = this.#socketRoom.get(socket.id);
    const broker = this.#setups.get(room ?? "");
    if (controllerId && controller && broker && room) {
      controller.join(room);
      broker.addController(controllerId);
      this.#pendingControllers.delete(password);
      socket.emit("controllerClaimYes");
      this.#socketRoom.set(controllerId, room);
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
      socket.id !== game.controller
    ) {
      return;
    }
    this.#namespace.to(game.board).emit("openGame");
  }

  /**
   * Join an existing room being setup
   */
  #joinRoom(socket: io.Socket, roomInfo: string, callback: () => void) {
    callback();
    const { id, name } = JSON.parse(roomInfo) as JoinRoomPayload;
    const game = this.#setups.get(id);
    if (game === undefined) {
      // Try to rejoin game in progress
      const inProgressGame = this.#games.get(id);
      if (inProgressGame?.addPlayer(socket.id, name)) {
        socket.emit("joinYes", "inProgress");
        socket.join(id);
        this.#socketRoom.set(socket.id, id);
        return;
      }

      const errorPayload: ErrorResponse = {
        reason: "This game code does not exist",
      };
      socket.emit("joinNo", JSON.stringify(errorPayload));
      return;
    }
    const addResult = game.addPlayer(socket.id, name);
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
      socket.id !== game.controller
    ) {
      return;
    }

    const boardSocket = this.#namespace.sockets.get(game.board);
    const controllerSocket = this.#namespace.sockets.get(game.controller);

    if (!boardSocket || !controllerSocket) {
      return;
    }

    const newGame = new KaXingGame(
      this.#namespace,
      game.questions,
      game.board,
      game.controller,
      game.players,
    );
    controllerSocket.removeAllListeners("kick");
    this.#games.set(room, newGame);
    this.#setups.delete(room);

    this.#namespace.to(room).emit("startGame");
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

  #cleanupRoomIfNeeded(socket: io.Socket) {
    const room = this.#socketRoom.get(socket.id);
    if (!room) {
      return;
    }
    const broker = this.#setups.get(room);
    const game = this.#games.get(room);

    if (broker?.allDisconnected) {
      console.log(`Cleaning up setup room ${room}`);
      this.#setups.delete(room);
    }

    if (game?.allDisconnected) {
      console.log(`Cleaning up game ${room}`);
      this.#games.delete(room);
    }
  }
}
