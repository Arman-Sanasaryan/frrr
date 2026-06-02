# Production deploy (aaaurrrssimpire.org)

## Architecture

One domain serves **both** the React app and the API:

- Site: `https://www.aaaurrrssimpire.org`
- API: same origin (no `localhost` in the browser)
- Google OAuth callback: `https://www.aaaurrrssimpire.org/auth/google/callback`

## On the server

1. Clone/pull the repo.
2. Copy secrets into `server/.env` (JWT, Stripe, VAPID, Google — never commit this file).
3. `server/.env.production` is already set for your domain (URLs only).
4. Install and build:

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run build
```

5. Start production (Node serves API + `client/build`):

```bash
npm run start:prod
```

Use **pm2** or **systemd** to keep it running, and **nginx** with SSL (see `nginx.conf.example`).

## Google Cloud Console

**Authorized redirect URIs:**

- `https://www.aaaurrrssimpire.org/auth/google/callback`
- `http://localhost:4000/auth/google/callback` (local dev)

**Authorized JavaScript origins:**

- `https://www.aaaurrrssimpire.org`
- `http://localhost:3001`

## Verify

- https://www.aaaurrrssimpire.org/health → `{"ok":true,"db":"connected"}`
- DevTools → Network: requests go to `https://www.aaaurrrssimpire.org/...`, not `localhost`
