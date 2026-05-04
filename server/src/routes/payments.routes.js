const express = require("express");
const {
  subscribeController,
  createCheckoutSessionController,
  webhookController
} = require("../controllers/payments.controller");

function createPaymentsRouter({ stripe, stripeWebhookSecret, publicBaseUrl }) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.stripe = stripe;
    req.stripeWebhookSecret = stripeWebhookSecret;
    req.publicBaseUrl = publicBaseUrl;
    next();
  });

  router.post("/subscribe", subscribeController);
  router.post("/create-checkout-session", createCheckoutSessionController);
  router.post("/webhook", express.raw({ type: "application/json" }), webhookController);

  return router;
}

module.exports = { createPaymentsRouter };
