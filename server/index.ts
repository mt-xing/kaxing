import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import KaXingServer from "./server.js";

const port = process.env.PORT || 8080;

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

new KaXingServer(io.of("/"));
