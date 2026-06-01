const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../repositories/user.repository");

function toSafeUser(user) {
  return {
    id: String(user._id),
    email: user.email
  };
}

async function loginByEmailPassword({
  email,
  password,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  const user = User.findOne({ email });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: accessTokenExpiresIn
  });
  const refreshToken = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: refreshTokenExpiresIn
  });
  return { token, refreshToken, user: toSafeUser(user) };
}

function refreshAccessToken({ refreshToken, jwtSecret, accessTokenExpiresIn }) {
  const data = jwt.verify(refreshToken, jwtSecret);
  const token = jwt.sign({ id: data.id }, jwtSecret, {
    expiresIn: accessTokenExpiresIn
  });
  return { token };
}

async function registerUser({ email, password }) {
  const hash = await bcrypt.hash(password, 8);
  try {
    User.insert({ email, password: hash });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  loginByEmailPassword,
  refreshAccessToken,
  registerUser
};
