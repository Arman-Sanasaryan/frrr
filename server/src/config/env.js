const path = require("path");

require("dotenv").config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const DEFAULT_SQLITE_PATH = path.join(__dirname, "../../data/shop.sqlite");

const env = {
  PORT: Number(process.env.PORT || 4000),
  SQLITE_PATH: process.env.SQLITE_PATH || DEFAULT_SQLITE_PATH,
  JWT_SECRET: requireEnv("JWT_SECRET"),
  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
  VAPID_SUBJECT: requireEnv("VAPID_SUBJECT"),
  VAPID_PUBLIC_KEY: requireEnv("VAPID_PUBLIC_KEY"),
  VAPID_PRIVATE_KEY: requireEnv("VAPID_PRIVATE_KEY"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:3001",
  STATIC_BASE_URL: process.env.STATIC_BASE_URL || "http://localhost:5500",
  CRYPTO_WALLET_BTC: process.env.CRYPTO_WALLET_BTC || "",
  CRYPTO_WALLET_ETH: process.env.CRYPTO_WALLET_ETH || "",
  CRYPTO_WALLET_USDT: process.env.CRYPTO_WALLET_USDT || "",
  CRYPTO_RATE_BTC: Number(process.env.CRYPTO_RATE_BTC || 6_500_000),
  CRYPTO_RATE_ETH: Number(process.env.CRYPTO_RATE_ETH || 350_000),
  CRYPTO_RATE_USDT: Number(process.env.CRYPTO_RATE_USDT || 92),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || ""
};

module.exports = { env };
