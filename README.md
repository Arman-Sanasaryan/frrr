Minimal FastAPI + static frontend project# frrr



Run:React client + Node/Express API for an online store.



1) Create and activate a virtualenv## Requirements



python -m venv .venv- Node.js 22+

.\.venv\Scripts\Activate.ps1  # PowerShell

## Quick start

2) Install deps

1. Install dependencies:

pip install -r requirements.txt   - `npm install` (root)

   - `npm --prefix server install`

3) Create .env from .env.example and set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID   - `npm --prefix client install`

2. Copy `server/.env.example` to `server/.env` and fill in your secrets.

4) Start server3. Run: `npm run start-all`



uvicorn main:app --reload --port 8000## Local URLs



Open http://localhost:8000- Store: http://localhost:3001

- API: http://localhost:4000
- Health check: http://localhost:4000/health

## Features

- Product catalog (`GET /products`)
- Registration / login
- Cart and crypto checkout
- My orders (`/orders`) after login

Data is stored locally in SQLite (file is created automatically; not committed to git).
