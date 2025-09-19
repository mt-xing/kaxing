import Socket from "../../player/socket.js";
import { postToWindow } from "./sideDispComm.js";

export default class BoardSocket extends Socket {
  on(type: string, callback: (msg: string) => void) {
    const cb = (msg: string) => {
      postToWindow(type, msg);
      callback(msg);
    };
    super.on(type, cb);
  }
}
