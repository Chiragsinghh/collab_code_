const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");
const cors = require("cors");
const connectDB = require("./db/mongo");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Enable large JSON body parsing to comfortably map base64 Y.Doc array payloads (usually 5-20mbs worst case)
app.use(express.json({ limit: "50mb" })); 

// Spin up persistence
connectDB();

app.use("/project", projectRoutes);
const server = http.createServer(app);

// Yjs WebSocket Server (No automatic listening, we handle upgrade manually)
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  console.log("🟢 Yjs client connected to room:", req.url);
  setupWSConnection(conn, req);
});

// Manual HTTP -> WebSocket upgrade handling
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith("/yjs/")) {
    const roomId = url.pathname.replace("/yjs/", "");

    console.log("🔗 Upgrade request for room:", roomId);

    wss.handleUpgrade(request, socket, head, (ws) => {
      // y-websocket expects the url to be strictly the roomname
      request.url = `/${roomId}`; 
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = 5001;

server.listen(PORT, () => {
  console.log(`🚀 CollabCode Backend running on port ${PORT}`);
  console.log(`🔌 WebSocket server at ws://localhost:${PORT}/yjs/:roomId`);
});