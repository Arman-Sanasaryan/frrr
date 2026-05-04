const {
  loginByEmailPassword,
  refreshAccessToken,
  registerUser
} = require("../services/auth.service");

async function userLogin(req, res) {
  const result = await loginByEmailPassword({
    email: req.body.email,
    password: req.body.password,
    jwtSecret: req.jwtSecret,
    accessTokenExpiresIn: req.accessTokenExpiresIn,
    refreshTokenExpiresIn: req.refreshTokenExpiresIn
  });

  if (!result) {
    return res.sendStatus(401);
  }

  return res.json(result);
}

function refresh(req, res) {
  const { refreshToken } = req.body;

  try {
    const result = refreshAccessToken({
      refreshToken,
      jwtSecret: req.jwtSecret,
      accessTokenExpiresIn: req.accessTokenExpiresIn
    });
    return res.json(result);
  } catch {
    return res.sendStatus(403);
  }
}

async function register(req, res) {
  await registerUser({
    email: req.body.email,
    password: req.body.password
  });
  return res.send("OK");
}

module.exports = {
  userLogin,
  refresh,
  register
};
