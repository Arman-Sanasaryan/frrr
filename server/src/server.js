const http = require("http");
const { Server } = require("socket.io");
const { app, PORT, registerSocketHandlers } = require("./app");
const { initDatabase, isDatabaseReady } = require("./db");
const { seedProductsIfEmpty } = require("./db/seed");

const httpServer = http.createServer(app);
const io = new Server(httpServer);

registerSocketHandlers(io);

function start() {
  try {
    initDatabase();
    seedProductsIfEmpty();
  } catch (error) {
    console.error("SQLite initialization failed:", error.message);
    process.exit(1);
  }

  httpServer.on("error", error => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or change PORT in server/.env`
      );
    } else {
      console.error("Server error:", error.message);
    }
    process.exit(1);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Database ready: ${isDatabaseReady()}`);
  });
}

start();
