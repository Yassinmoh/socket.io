const express = require("express");
const https = require("https");
const socketIO = require("socket.io");
const fs = require("fs");

const app = express();
app.use(express.static("public"));

//Server configuration:
const server = https.createServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
}, app);

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("new client connected!");

  // Listen for "objectPosition" event from clients
  socket.on("updatePlayerPosition", (data) => {
    console.log("Received objectPosition event:", data);
    socket.broadcast.emit("updatePlayerPosition", data);
  });

  // Listen for "updateFormation" event from clients
  socket.on("updateFormation", (formation) => {
    console.log("Received updateFormation event:", formation);
    io.emit("updateFormation", formation);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A client disconnected!");
  });
});

const port = 8000; // You can change this to any available port
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
