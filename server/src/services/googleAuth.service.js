function isGoogleAuthConfigured(env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function getGoogleRedirectUri(env) {
  return env.GOOGLE_CALLBACK_URL;
}

function buildGoogleAuthUrl(env) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(env),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function fetchGoogleProfile({ code, env }) {
  const redirectUri = getGoogleRedirectUri(env);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok || !tokens.access_token) {
    throw new Error(tokens.error_description || "Google token exchange failed");
  }

  const profileResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    }
  );

  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.email) {
    throw new Error("Failed to load Google profile");
  }

  return {
    id: String(profile.id),
    email: profile.email,
    name: profile.name || profile.given_name || profile.email.split("@")[0],
    picture: profile.picture || ""
  };
}

module.exports = {
  isGoogleAuthConfigured,
  buildGoogleAuthUrl,
  fetchGoogleProfile,
  getGoogleRedirectUri
};
