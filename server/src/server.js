const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { app, PORT, MONGODB_URI, registerSocketHandlers } = require("./app");

const httpServer = http.createServer(app);
const io = new Server(httpServer);
const localMongoUri = "mongodb://127.0.0.1:27017/shop";

registerSocketHandlers(io);

async function start() {
  let dbConnected = false;
  try {
    await mongoose.connect(MONGODB_URI);
    dbConnected = true;
  } catch (error) {
    if (MONGODB_URI !== localMongoUri) {
      console.warn("Primary MongoDB connection failed, trying local fallback...");
      try {
        await mongoose.connect(localMongoUri);
        dbConnected = true;
      } catch {
        dbConnected = false;
      }
    } else {
      dbConnected = false;
    }
  }

  httpServer.listen(PORT, () => {
    if (dbConnected) {
      console.log("🚀 Server started");
    } else {
      console.warn("⚠️ Server started without MongoDB connection");
    }
  });
}

start().catch(err => {
  console.error("Unexpected startup error", err);
  process.exit(1);
});
