const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { app, PORT, MONGODB_URI, registerSocketHandlers } = require("./app");

const httpServer = http.createServer(app);
const io = new Server(httpServer);

registerSocketHandlers(io);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log("🚀 Server started");
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
