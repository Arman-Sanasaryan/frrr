from flask import Flask, request, jsonify, send_from_directory
import os
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# session_id -> list of messages
sessions: dict = {}

app = Flask(__name__, static_folder='static')

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/notify', methods=['OPTIONS'])
def notify_options():
    return add_cors(app.make_response(''))

@app.route('/messages', methods=['OPTIONS'])
def messages_options():
    return add_cors(app.make_response(''))

@app.route('/messages/ack', methods=['OPTIONS'])
def ack_options():
    return add_cors(app.make_response(''))


@app.route('/')
def index():
    try:
        with open('static/index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return send_from_directory('static', 'index.html')


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

    if session_id in sessions:
        sessions[session_id] = [m for m in sessions[session_id] if m.get('id') not in ids]

    return jsonify({'ok': True, 'remaining': len(sessions.get(session_id, []))})


@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    if not data:
        return jsonify({'ok': True})

    msg = data.get('message')
    if not msg:
        return jsonify({'ok': True})

    chat_id = msg.get('chat', {}).get('id')
    if str(chat_id) != str(TELEGRAM_CHAT_ID):
        return jsonify({'ok': True})

    text = msg.get('text', '')
    if not text or not text.startswith('/'):
        return jsonify({'ok': True})

    parts = text.split(' ', 1)
    tag = parts[0][1:]  # strip leading /
    reply_text = parts[1].strip() if len(parts) > 1 else ''
    if not reply_text:
        return jsonify({'ok': True})

    for sid in list(sessions.keys()):
        if sid.startswith(tag):
            sessions[sid].append({
                'id': msg.get('message_id'),
                'from': 'Seller',
                'text': reply_text,
            })
            break

    return jsonify({'ok': True})