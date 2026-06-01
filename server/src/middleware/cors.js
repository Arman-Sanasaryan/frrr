const { env } = require("../config/env");

function createCorsMiddleware() {
  const allowedOrigins = new Set([
    env.PUBLIC_BASE_URL,
    "https://www.aaaurrrssimpire.org",
    "https://aaaurrrssimpire.org",
    "http://localhost:3001",
    "http://localhost:4000"
  ]);

  return (req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || env.PUBLIC_BASE_URL);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  };
}

module.exports = { createCorsMiddleware };
