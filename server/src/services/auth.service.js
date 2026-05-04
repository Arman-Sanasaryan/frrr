const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

function toSafeUser(user) {
  return {
    id: String(user._id),
    email: user.email
  };
}

function loginByEmailPassword({
  email,
  password,
  jwtSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}) {
  return User.findOne({ email }).then(async user => {
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
  });
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
  const user = new User({ email, password: hash });
  await user.save();
}

module.exports = {
  loginByEmailPassword,
  refreshAccessToken,
  registerUser
};
