const path = require("path");
const fs = require("fs");
const express = require("express");

const CLIENT_BUILD = path.join(__dirname, "../../../client/build");

const API_PATH_PREFIXES = [
  "/auth",
  "/health",
  "/user-login",
  "/register",
  "/refresh",
  "/crypto",
  "/my-orders",
  "/orders",
  "/create-order",
  "/order",
  "/products",
  "/add-product",
  "/delete-product",
  "/add-review",
  "/reviews",
  "/subscribe",
  "/create-checkout-session",
  "/webhook",
  "/uploads",
  "/socket.io"
];

function isApiPath(requestPath) {
  return API_PATH_PREFIXES.some(prefix => {
    if (requestPath === prefix) {
      return true;
    }
    return requestPath.startsWith(`${prefix}/`);
  });
}

function createServeClientMiddleware() {
  if (!fs.existsSync(CLIENT_BUILD)) {
    console.warn(
      "Client build not found. Run: npm run build (from project root)"
    );
    return (_req, _res, next) => next();
  }

  console.log(`Serving React build from ${CLIENT_BUILD}`);

  const staticMiddleware = express.static(CLIENT_BUILD, { index: false });

  return (req, res, next) => {
    if (req.method !== "GET" || isApiPath(req.path)) {
      return next();
    }

    return staticMiddleware(req, res, error => {
      if (error) {
        return next(error);
      }
      if (res.headersSent) {
        return;
      }
      res.sendFile(path.join(CLIENT_BUILD, "index.html"));
    });
  };
}

module.exports = { createServeClientMiddleware, CLIENT_BUILD };
