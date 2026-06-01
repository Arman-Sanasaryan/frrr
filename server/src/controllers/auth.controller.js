const {
  loginByEmailPassword,
  refreshAccessToken,
  registerUser,
  loginGoogleUser
} = require("../services/auth.service");
const {
  isGoogleAuthConfigured,
  buildGoogleAuthUrl,
  fetchGoogleProfile
} = require("../services/googleAuth.service");

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
  try {
    await registerUser({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    });
    return res.send("OK");
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json({ message: error.message || "Registration failed" });
  }
}

function authProviders(req, res) {
  return res.json({
    google: isGoogleAuthConfigured(req.env)
  });
}

function googleStart(req, res) {
  if (!isGoogleAuthConfigured(req.env)) {
    return res.status(503).json({ message: "Google sign-in is not configured" });
  }

  return res.redirect(buildGoogleAuthUrl(req.env));
}

async function googleCallback(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${req.env.PUBLIC_BASE_URL}/auth/callback?error=google_denied`
    );
  }

  try {
    const profile = await fetchGoogleProfile({ code, env: req.env });
    const result = loginGoogleUser({
      profile,
      jwtSecret: req.jwtSecret,
      accessTokenExpiresIn: req.accessTokenExpiresIn,
      refreshTokenExpiresIn: req.refreshTokenExpiresIn
    });

    const params = new URLSearchParams({
      token: result.token,
      refresh: result.refreshToken,
      name: result.user.name,
      email: result.user.email
    });
    if (result.user.avatarUrl) {
      params.set("avatar", result.user.avatarUrl);
    }

    return res.redirect(
      `${req.env.PUBLIC_BASE_URL}/auth/callback?${params.toString()}`
    );
  } catch {
    return res.redirect(
      `${req.env.PUBLIC_BASE_URL}/auth/callback?error=google_failed`
    );
  }
}

module.exports = {
  userLogin,
  refresh,
  register,
  authProviders,
  googleStart,
  googleCallback
};
