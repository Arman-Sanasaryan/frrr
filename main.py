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

# session_id -> list of messages for that session
sessions: dict[str, list] = {}

last_update_id = None

import asyncio

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index():
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            html = f.read()
    except Exception:
        return FileResponse("static/index.html")

    injected = f"<script>window.SHOP_CONFIG = {{ SHOP_SECRET: '{SHOP_SECRET}' }};</script>"
    html = html.replace(
        '<script src="/static/app.js"></script>',
        injected + '\n  <script src="/static/app.js"></script>'
    )
    return HTMLResponse(content=html, status_code=200)





@app.post("/notify")
async def notify(request: Request):
    payload = await request.json()
    message = payload.get("message")
    session_id = payload.get("session_id", "unknown")

    if not message:
        return JSONResponse({"ok": False, "error": "message required"}, status_code=400)

    # make sure session exists
    if session_id not in sessions:
        sessions[session_id] = []

    # short 6-char tag for easy replies: /a3f2c1 text
    tag = session_id[:6]
    full_message = f"[{tag}] {message}"

    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {"chat_id": TELEGRAM_CHAT_ID, "text": full_message}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=data)
                return JSONResponse({"ok": True, "telegram": resp.json()})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

    return JSONResponse({"ok": False, "error": "telegram not configured"}, status_code=400)


@app.get("/messages")
async def get_messages(request: Request):
    session_id = request.query_params.get("session_id", "")
    msgs = sessions.get(session_id, [])
    return JSONResponse({"ok": True, "messages": msgs})


@app.post("/messages/ack")
async def ack_messages(request: Request):
    payload = await request.json()
    session_id = payload.get("session_id", "")
    ids = payload.get("ids") or []

    if not isinstance(ids, list):
        return JSONResponse({"ok": False, "error": "ids must be a list"}, status_code=400)

    if session_id in sessions:
        sessions[session_id] = [m for m in sessions[session_id] if m.get("id") not in ids]

    return JSONResponse({"ok": True, "remaining": len(sessions.get(session_id, []))})


async def poll_telegram_updates():
    global last_update_id
    if not TELEGRAM_TOKEN:
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
    async with httpx.AsyncClient(timeout=20.0) as client:
        while True:
            params = {"timeout": 10}
            if last_update_id is not None:
                params["offset"] = last_update_id + 1
            try:
                resp = await client.get(url, params=params)
                data = resp.json()
                if data.get("ok"):
                    for upd in data.get("result", []):
                        last_update_id = upd.get("update_id")
                        msg = upd.get("message")
                        if not msg:
                            continue

                        # only handle messages from our configured chat
                        chat_id = msg.get("chat", {}).get("id")
                        if str(chat_id) != str(TELEGRAM_CHAT_ID):
                            continue

                        text = msg.get("text", "")
                        if not text:
                            continue

                        # parse owner replies: /a3f2c1 Hello there
                        if text.startswith("/"):
                            parts = text.split(" ", 1)
                            tag = parts[0][1:]  # strip leading /
                            reply_text = parts[1].strip() if len(parts) > 1 else ""
                            if not reply_text:
                                continue
                            # find matching session by prefix
                            for sid in list(sessions.keys()):
                                if sid.startswith(tag):
                                    sessions[sid].append({
                                        "id": msg.get("message_id"),
                                        "from": "Seller",
                                        "text": reply_text,
                                    })
                                    break

                await asyncio.sleep(2)
            except Exception:
                await asyncio.sleep(5)


@app.on_event("startup")
async def start_polling():
    if TELEGRAM_TOKEN:
        asyncio.create_task(poll_telegram_updates())