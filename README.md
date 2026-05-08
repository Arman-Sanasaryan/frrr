# frrr

Frontend and backend are now unified into a React client + Node/Express API.

## Quick start

1. Install dependencies:
   - `npm install` (root)
   - `npm --prefix server install`
   - `npm --prefix client install`
2. Set `server/.env` values (Mongo, JWT, Stripe, VAPID if needed).
3. Run both apps:
   - `npm run start-all`

## Local URLs

- Client: `http://localhost:3001`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`
