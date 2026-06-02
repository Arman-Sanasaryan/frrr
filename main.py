from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
SHOP_SECRET = os.getenv("SHOP_SECRET", "")

# in-memory storage for incoming telegram messages (simple, non-persistent)
messages = []
last_update_id = None

import asyncio


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index():
    # serve index.html but inject SHOP_SECRET into a small JS config so frontend can read it
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            html = f.read()
    except Exception:
        return FileResponse("static/index.html")

    injected = f"<script>window.SHOP_CONFIG = {{ SHOP_SECRET: '{SHOP_SECRET}' }};</script>"
    # insert injected script before the main app script tag
    html = html.replace("<script src=\"/static/app.js\"></script>", injected + "\n  <script src=\"/static/app.js\"></script>")
    return HTMLResponse(content=html, status_code=200)


@app.post("/notify")
async def notify(request: Request):
    # simple secret check: either Authorization: Bearer <secret> or X-SHOP-SECRET header
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    header_secret = request.headers.get("X-SHOP-SECRET") or request.headers.get("x-shop-secret")
    provided = None
    if auth and auth.lower().startswith("bearer "):
        provided = auth.split(" ", 1)[1].strip()
    elif header_secret:
        provided = header_secret.strip()
    if not SHOP_SECRET or provided != SHOP_SECRET:
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    payload = await request.json()
    message = payload.get("message")
    subject = payload.get("subject")
    if not message:
        return JSONResponse({"ok": False, "error": "message required"}, status_code=400)

    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=data)
                return JSONResponse({"ok": True, "telegram": resp.json()})
        except Exception as e:
            return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

    return JSONResponse({"ok": False, "error": "telegram not configured"}, status_code=400)


@app.get('/messages')
async def get_messages():
    # return stored incoming messages
    return JSONResponse({"ok": True, "messages": messages})


@app.post('/messages/ack')
async def ack_messages(request: Request):
    # require same secret as /notify
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    header_secret = request.headers.get("X-SHOP-SECRET") or request.headers.get("x-shop-secret")
    provided = None
    if auth and auth.lower().startswith("bearer "):
        provided = auth.split(" ", 1)[1].strip()
    elif header_secret:
        provided = header_secret.strip()
    if not SHOP_SECRET or provided != SHOP_SECRET:
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    payload = await request.json()
    ids = payload.get('ids') or []
    if not isinstance(ids, list):
        return JSONResponse({"ok": False, "error": "ids must be a list"}, status_code=400)
    # remove messages with these ids
    global messages
    messages = [m for m in messages if m.get('id') not in ids]
    return JSONResponse({"ok": True, "remaining": len(messages)})


async def poll_telegram_updates():
    global last_update_id, messages
    if not TELEGRAM_TOKEN:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
    async with httpx.AsyncClient(timeout=20.0) as client:
        while True:
            params = {}
            if last_update_id is not None:
                params['offset'] = last_update_id + 1
            try:
                resp = await client.get(url, params=params)
                data = resp.json()
                if data.get('ok'):
                    for upd in data.get('result', []):
                        last_update_id = upd.get('update_id')
                        msg = upd.get('message')
                        if not msg:
                            continue
                        chat = msg.get('chat', {})
                        chat_id = chat.get('id')
                        text = msg.get('text')
                        if text is None:
                            continue
                        # only store messages for our configured chat id
                        try:
                            if str(chat_id) == str(TELEGRAM_CHAT_ID):
                                messages.append({
                                    'id': msg.get('message_id'),
                                    'from': chat.get('first_name') or chat.get('username'),
                                    'text': text
                                })
                        except Exception:
                            pass
                await asyncio.sleep(2)
            except Exception:
                await asyncio.sleep(5)


@app.on_event('startup')
async def start_polling():
    # start background polling of Telegram updates
    if TELEGRAM_TOKEN:
        asyncio.create_task(poll_telegram_updates())
