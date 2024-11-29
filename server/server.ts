import * as io from "socket.io";
import KaXingGame from "./game.js";
import Broker from "./broker.js";
import {
  ControllerJoinResponse,
  ErrorResponse,
  JoinRoomPayload,
} from "../shared/payloads.js";

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
      socket.on("create", this.#createRoom.bind(this, socket));
      socket.on("controller", this.#controllerJoin.bind(this, socket));
      socket.on("controllerClaim", this.#controllerClaim.bind(this, socket));
      socket.on("join", this.#joinRoom.bind(this, socket));

      socket.on("start", this.#startGame.bind(this, socket));

      // socket.on("disconnect", this.#endGame.bind(this, socket));
    });
  }

  /**
   * Attempt to create a new room
   */
  #createRoom(socket: io.Socket, gameInfo: string) {
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

  #controllerJoin(socket: io.Socket) {
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

  #controllerClaim(socket: io.Socket, payload: string) {
    const { password } = JSON.parse(payload) as ControllerJoinResponse;
    const controller = this.#pendingControllers.get(password);
    const room = this.#socketRoom.get(socket.id);
    const broker = this.#setups.get(room ?? "");
    if (controller && broker && room) {
      controller.join(room);
      broker.addController(controller);
      this.#pendingControllers.delete(password);
      socket.emit("controllerClaimYes");
    } else {
      const errorPayload: ErrorResponse = {
        reason: "Invalid password",
      };
      socket.emit("controllerClaimNo", JSON.stringify(errorPayload));
    }
  }

  /**
   * Join an existing room being setup
   * @param {io.Socket} socket
   * @param {string} roomInfo
   */
  #joinRoom(socket: io.Socket, roomInfo: string) {
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
  #startGame(socket: io.Socket) {
    const room = this.#socketRoom.get(socket.id);
    const game = this.#setups.get(room ?? "");
    if (
      game === undefined ||
      room === undefined ||
      socket !== game.controller
    ) {
      return;
    }

    // const nameSpace = this.#namespace.to(room);
    // const communicator = new Communicator(
    //   game.playerToSocket,
    //   nameSpace.emit.bind(nameSpace),
    // );
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
}
