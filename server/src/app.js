const express = require("express");
const Stripe = require("stripe");
const { isDatabaseReady } = require("./db");
const { createCorsMiddleware } = require("./middleware/cors");
const { createServeClientMiddleware } = require("./middleware/serveClient");
const { createAuthRouter } = require("./routes/auth.routes");
const {
  createAuthMiddleware,
  createOptionalAuthMiddleware
} = require("./middleware/auth.middleware");
const { createCryptoRouter } = require("./routes/crypto.routes");
const { createOrdersRouter } = require("./routes/orders.routes");
const { createProductsRouter } = require("./routes/products.routes");
const { createReviewsRouter } = require("./routes/reviews.routes");
const { createPaymentsRouter } = require("./routes/payments.routes");
const { configurePush } = require("./services/push.service");
const { env } = require("./config/env");

const stripe = Stripe(env.STRIPE_SECRET_KEY);

configurePush({
  subject: env.VAPID_SUBJECT,
  publicKey: env.VAPID_PUBLIC_KEY,
  privateKey: env.VAPID_PRIVATE_KEY
});

const app = express();
app.set("trust proxy", 1);
app.use(createCorsMiddleware());
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    db: isDatabaseReady() ? "connected" : "disconnected"
  });
});
app.use(createAuthRouter({
  jwtSecret: env.JWT_SECRET,
  accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  env
}));
const auth = createAuthMiddleware(env.JWT_SECRET);
const optionalAuth = createOptionalAuthMiddleware(env.JWT_SECRET);
app.use(createCryptoRouter({ optionalAuth, cryptoEnv: env }));
app.use(createOrdersRouter({ auth, stripe, publicBaseUrl: env.PUBLIC_BASE_URL }));
app.use(createProductsRouter({ auth, publicBaseUrl: env.PUBLIC_BASE_URL }));
app.use(createReviewsRouter());
app.use(createPaymentsRouter({
  stripe,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  publicBaseUrl: env.PUBLIC_BASE_URL
}));

if (env.SERVE_CLIENT) {
  app.use(createServeClientMiddleware());
}

function registerSocketHandlers(io) {
  io.on("connection", socket => {
    socket.on("sendMessage", msg => {
      io.emit("newMessage", msg);
    });
  });
}

module.exports = {
  app,
  PORT: env.PORT,
  env,
  registerSocketHandlers
};
