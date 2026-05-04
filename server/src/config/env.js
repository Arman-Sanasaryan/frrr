function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shop",
  JWT_SECRET: requireEnv("JWT_SECRET"),
  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
  VAPID_SUBJECT: requireEnv("VAPID_SUBJECT"),
  VAPID_PUBLIC_KEY: requireEnv("VAPID_PUBLIC_KEY"),
  VAPID_PRIVATE_KEY: requireEnv("VAPID_PRIVATE_KEY"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `http://localhost:${Number(process.env.PORT || 3000)}`,
  STATIC_BASE_URL: process.env.STATIC_BASE_URL || "http://localhost:5500"
};

module.exports = { env };
