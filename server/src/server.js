const http = require("http");
const { Server } = require("socket.io");
const { app, PORT, env, registerSocketHandlers } = require("./app");
const { initDatabase, isDatabaseReady } = require("./db");
const { seedProductsIfEmpty } = require("./db/seed");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      env.PUBLIC_BASE_URL,
      "https://www.aaaurrrssimpire.org",
      "https://aaaurrrssimpire.org",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST"]
  }
});

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
    console.log(`Server listening on port ${PORT}`);
    console.log(`Public site: ${env.PUBLIC_BASE_URL}`);
    if (env.GOOGLE_CLIENT_ID) {
      console.log(`Google callback: ${env.GOOGLE_CALLBACK_URL}`);
    }
    console.log(`Database ready: ${isDatabaseReady()}`);
    console.log(`Serve client build: ${env.SERVE_CLIENT}`);
  });
}

start();
