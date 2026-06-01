# frrr

React client + Node/Express API for an online store.

## Requirements

- Node.js 22+

## Quick start

1. Install dependencies:
   - `npm install` (root)
   - `npm --prefix server install`
   - `npm --prefix client install`
2. Copy `server/.env.example` to `server/.env` and fill in your secrets.
3. Run: `npm run start-all`

## Local URLs

- Store: http://localhost:3001
- API: http://localhost:4000
- Health check: http://localhost:4000/health

## Features

- Product catalog (`GET /products`)
- Registration / login
- Cart and crypto checkout
- My orders (`/orders`) after login

Data is stored locally in SQLite (file is created automatically; not committed to git).
