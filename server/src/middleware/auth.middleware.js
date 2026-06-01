const jwt = require("jsonwebtoken");

function createAuthMiddleware(jwtSecret) {
  return function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(403);

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : authHeader;
    if (!token) return res.sendStatus(403);

    try {
      req.user = jwt.verify(token, jwtSecret);
      next();
    } catch {
      res.sendStatus(403);
    }
  };
}

function createOptionalAuthMiddleware(jwtSecret) {
  return function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : authHeader;
    if (!token) {
      return next();
    }

    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch {
      // Guest checkout is allowed.
    }
    return next();
  };
}

module.exports = { createAuthMiddleware, createOptionalAuthMiddleware };
