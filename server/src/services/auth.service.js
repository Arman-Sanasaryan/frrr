const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../repositories/user.repository");

function toSafeUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || "",
    avatarUrl: user.avatarUrl || ""
  };
}

function issueTokens({
  userId,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: accessTokenExpiresIn
  });
  const refreshToken = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: refreshTokenExpiresIn
  });
  return { token, refreshToken };
}

function createAuthResult({
  user,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  const { token, refreshToken } = issueTokens({
    userId: user._id,
    jwtSecret,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  });
  return { token, refreshToken, user: toSafeUser(user) };
}

async function loginByEmailPassword({
  email,
  password,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  const user = User.findOne({ email });
  if (!user || !user.password) {
    return null;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return null;
  }

  return createAuthResult({
    user,
    jwtSecret,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  });
}

function refreshAccessToken({ refreshToken, jwtSecret, accessTokenExpiresIn }) {
  const data = jwt.verify(refreshToken, jwtSecret);
  const token = jwt.sign({ id: data.id }, jwtSecret, {
    expiresIn: accessTokenExpiresIn
  });
  return { token };
}

async function registerUser({ email, password, name }) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) {
    const error = new Error("Name is required");
    error.status = 400;
    throw error;
  }

  const hash = await bcrypt.hash(password, 8);
  try {
    return User.insert({ email, password: hash, name: trimmedName });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

function loginGoogleUser({
  profile,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  const user = User.upsertGoogleUser({
    googleId: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture
  });

  return createAuthResult({
    user,
    jwtSecret,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  });
}

module.exports = {
  loginByEmailPassword,
  refreshAccessToken,
  registerUser,
  loginGoogleUser,
  toSafeUser
};
