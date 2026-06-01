const express = require("express");
const { createCryptoCheckoutController } = require("../controllers/crypto.controller");

function createCryptoRouter({ optionalAuth, cryptoEnv }) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.cryptoEnv = cryptoEnv;
    next();
  });

  router.post("/crypto/checkout", optionalAuth, createCryptoCheckoutController);

  return router;
}

module.exports = { createCryptoRouter };
