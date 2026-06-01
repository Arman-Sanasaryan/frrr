const express = require("express");
const {
  userLogin,
  refresh,
  register,
  authProviders,
  googleStart,
  googleCallback
} = require("../controllers/auth.controller");

function createAuthRouter({
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
  env
}) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.jwtSecret = jwtSecret;
    req.accessTokenExpiresIn = accessTokenExpiresIn;
    req.refreshTokenExpiresIn = refreshTokenExpiresIn;
    req.env = env;
    next();
  });

  router.get("/auth/providers", authProviders);
  router.get("/auth/google", googleStart);
  router.get("/auth/google/callback", googleCallback);
  router.post("/user-login", userLogin);
  router.post("/refresh", refresh);
  router.post("/register", register);

  return router;
}

module.exports = { createAuthRouter };
