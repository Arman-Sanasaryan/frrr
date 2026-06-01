import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { getApiBaseUrl } from "../api/config";

const socketUrl = getApiBaseUrl();

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socket = useMemo(() => io(socketUrl, { autoConnect: true }), []);

  useEffect(() => {
    function handleMessage(msg) {
      if (typeof msg !== "string" || !msg.trim()) {
        return;
      }
      setMessages(prev => [...prev, msg]);
    }

    socket.on("newMessage", handleMessage);
    return () => {
      socket.off("newMessage", handleMessage);
      socket.disconnect();
    };
  }, [socket]);

  function sendMessage() {
    const value = text.trim();
    if (!value) {
      return;
    }
    socket.emit("sendMessage", value);
    setText("");
  }

  return (
    <div className="chat-widget">
      <h3>Чат</h3>
      <div className="chat-box">
        {messages.length === 0 ? <p>Сообщений пока нет.</p> : null}
        {messages.map((msg, index) => (
          <p key={`${msg}-${index}`}>{msg}</p>
        ))}
      </div>
      <div className="chat-actions">
        <input
          type="text"
          value={text}
          placeholder="Введите сообщение"
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
}
