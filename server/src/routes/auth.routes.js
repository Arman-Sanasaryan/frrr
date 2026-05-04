const express = require("express");
const {
  userLogin,
  refresh,
  register
} = require("../controllers/auth.controller");

function createAuthRouter({ jwtSecret, accessTokenExpiresIn, refreshTokenExpiresIn }) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.jwtSecret = jwtSecret;
    req.accessTokenExpiresIn = accessTokenExpiresIn;
    req.refreshTokenExpiresIn = refreshTokenExpiresIn;
    next();
  });

  router.post("/user-login", userLogin);
  router.post("/refresh", refresh);
  router.post("/register", register);

  return router;
}

module.exports = { createAuthRouter };
