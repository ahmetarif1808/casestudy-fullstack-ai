import { useEffect, useState } from "react";
import { sendMessage, getMessages } from "./api";
import MessageItem from "./MessageItem";

export default function App() {
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMessages();
      // garantile: kesinlikle array olsun
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("load error:", err);
      setError("Mesajlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(nickname || "anonymous", text);
      setText("");
      await load();
    } catch (err) {
      console.error("sendMessage error:", err);
      alert("Gönderilemedi: " + (err?.message || err));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">AI Sentiment Chat</h1>

      <div className="mb-4">
        <input
          className="w-full p-3 border rounded-lg"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <textarea
          className="w-full p-3 border rounded-lg"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        onClick={handleSend}
        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow"
      >
        Send
      </button>

      <div className="mt-8 space-y-4">
        {loading && <div>Yükleniyor...</div>}
        {error && <div className="text-red-600">Hata: {error}</div>}

        {/* Güvenli render: messages kesinlikle array olmalı */}
        {Array.isArray(messages) && messages.length === 0 && !loading && (
          <div className="text-center text-slate-500">Henüz mesaj yok.</div>
        )}

        {Array.isArray(messages)
          ? messages.map((m) => <MessageItem key={m.id ?? Math.random()} msg={m} />)
          : <div className="text-red-600">Sunucudan beklenmeyen bir cevap alındı.</div>}
      </div>
    </div>
  );
}
