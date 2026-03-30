const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const app = express();
app.use(cors());

const server = http.createServer(app);

// ✅ Socket.IO (chat)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket.io Connected:", socket.id);
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });
  socket.on("send-message", (data) => {
    io.to(data.roomId).emit("receive-message", data);
  });
});

// ✅ Yjs WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  // We need to strip the '/yjs' prefix for y-websocket to find the room name correctly
  req.url = req.url.replace('/yjs', '');
  setupWSConnection(conn, req);
});

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  if (pathname.startsWith("/yjs")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
  // Socket.io handles its own upgrades automatically through the http server
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});