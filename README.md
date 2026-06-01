# frrr

Frontend and backend: React client + Node/Express API.

## Database (on your hard drive)

Data is stored in a **SQLite file** — no MongoDB, no Docker:

- Default path: `server/data/shop.sqlite`
- Created automatically on first server start
- Users, orders, products, and reviews persist on disk

Optional: set a custom path in `server/.env`:

```env
SQLITE_PATH=C:\Users\User\Documents\frrr-shop.sqlite
```

## Requirements

- **Node.js 22+** (uses built-in `node:sqlite` — no MongoDB/Docker)

## Quick start

1. Install dependencies:
   - `npm install` (root)
   - `npm --prefix server install`
   - `npm --prefix client install`
2. Copy `server/.env.example` → `server/.env` and set secrets (JWT, Stripe, VAPID, crypto wallets).
3. Run both apps:
   - `npm run start-all`
4. In the terminal you should see: `Server listening on http://localhost:4000`
   - If the server exits immediately, read the error in the `[server]` lines (common: port 4000 already in use).

**Troubleshooting `-102` / connection refused:** the API is not running. Stop old terminals (`Ctrl+C`), then run `npm run start-all` again and wait for the server line before opening `/health`.

## Local URLs

- Client: `http://localhost:3001`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health` (shows `dbPath` to the sqlite file)

## Crypto checkout

1. Add wallet addresses to `server/.env`.
2. Cart → **Оформить** → choose coin → pay to the generated address.
3. Orders are saved in `shop.sqlite` with status `pending_crypto`.

## Catalog & orders

- Products on the home page come from `GET /products` (SQLite).
- On first start, 120 demo products are seeded if the products table is empty.
- After login, use **Мои заказы** (`/orders`) — data from `GET /my-orders`.
- To reset the catalog: stop the server, delete `server/data/shop.sqlite`, start again.
