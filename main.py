from flask import Flask, request, jsonify, send_from_directory, render_template_string
import os
import threading
import time
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# session_id -> list of messages
sessions: dict = {}
last_update_id = None

app = Flask(__name__, static_folder='static')


@app.route('/')
def index():
    try:
        with open('static/index.html', 'r', encoding='utf-8') as f:
            html = f.read()
    except Exception:
        return send_from_directory('static', 'index.html')
    return html


@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


@app.route('/notify', methods=['POST'])
def notify():
    payload = request.get_json()
    message = payload.get('message')
    session_id = payload.get('session_id', 'unknown')

    if not message:
        return jsonify({'ok': False, 'error': 'message required'}), 400

    if session_id not in sessions:
        sessions[session_id] = []

    tag = session_id[:6]
    full_message = f"[{tag}] {message}"

    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {'chat_id': TELEGRAM_CHAT_ID, 'text': full_message}
        try:
            resp = requests.post(url, json=data, timeout=10)
            return jsonify({'ok': True, 'telegram': resp.json()})
        except Exception as e:
            return jsonify({'ok': False, 'error': str(e)}), 500

    return jsonify({'ok': False, 'error': 'telegram not configured'}), 400


@app.route('/messages', methods=['GET'])
def get_messages():
    session_id = request.args.get('session_id', '')
    msgs = sessions.get(session_id, [])
    return jsonify({'ok': True, 'messages': msgs})


@app.route('/messages/ack', methods=['POST'])
def ack_messages():
    payload = request.get_json()
    session_id = payload.get('session_id', '')
    ids = payload.get('ids') or []

    if not isinstance(ids, list):
        return jsonify({'ok': False, 'error': 'ids must be a list'}), 400

    if session_id in sessions:
        sessions[session_id] = [m for m in sessions[session_id] if m.get('id') not in ids]

    return jsonify({'ok': True, 'remaining': len(sessions.get(session_id, []))})


def poll_telegram_updates():
    global last_update_id
    if not TELEGRAM_TOKEN:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
    while True:
        params = {'timeout': 10}
        if last_update_id is not None:
            params['offset'] = last_update_id + 1
        try:
            resp = requests.get(url, params=params, timeout=20)
            data = resp.json()
            if data.get('ok'):
                for upd in data.get('result', []):
                    last_update_id = upd.get('update_id')
                    msg = upd.get('message')
                    if not msg:
                        continue
                    chat_id = msg.get('chat', {}).get('id')
                    if str(chat_id) != str(TELEGRAM_CHAT_ID):
                        continue
                    text = msg.get('text', '')
                    if not text:
                        continue
                    if text.startswith('/'):
                        parts = text.split(' ', 1)
                        tag = parts[0][1:]
                        reply_text = parts[1].strip() if len(parts) > 1 else ''
                        if not reply_text:
                            continue
                        for sid in list(sessions.keys()):
                            if sid.startswith(tag):
                                sessions[sid].append({
                                    'id': msg.get('message_id'),
                                    'from': 'Seller',
                                    'text': reply_text,
                                })
                                break
            time.sleep(2)
        except Exception:
            time.sleep(5)


# start polling in background thread
if TELEGRAM_TOKEN:
    t = threading.Thread(target=poll_telegram_updates, daemon=True)
    t.start()