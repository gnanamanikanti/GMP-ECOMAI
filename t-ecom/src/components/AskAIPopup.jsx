import { useEffect, useMemo, useState } from "react";

const QUICK_PROMPTS = [
  "Suggest a laptop for office work",
  "Show best value products",
  "What products are in stock?",
];

function AskAIPopup() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I am your GPM EcomAI assistant. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL ?? "http://localhost:8080";

  const canSend = useMemo(() => input.trim().length > 0 && !isTyping, [input, isTyping]);

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const askBot = async (messageText) => {
    const url = `${baseUrl}/api/chat/ask?message=${encodeURIComponent(messageText)}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Unable to connect to AI assistant.");
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return typeof data === "string" ? data : data.response || JSON.stringify(data);
    }
    return response.text();
  };

  const sendMessage = async (text) => {
    const finalText = text.trim();
    if (!finalText) return;

    setMessages((prev) => [...prev, { role: "user", text: finalText }]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const reply = await askBot(finalText);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {open && <button className="ask-popup-backdrop" onClick={() => setOpen(false)} aria-label="Close chat background" />}

      <div className={`ask-popup-panel ${open ? "show" : ""}`} role="dialog" aria-label="Ask AI popup">
        <div className="ask-popup-header">
          <div>
            <h6 className="mb-0">Ask AI</h6>
            <small>Instant shopping help</small>
          </div>
          <button className="btn btn-sm btn-light" onClick={() => setOpen(false)} aria-label="Close chat">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="ask-popup-quick">
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" className="quick-chip border-0" onClick={() => sendMessage(prompt)} disabled={isTyping}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="ask-popup-body">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`ask-bubble ${msg.role === "user" ? "user" : "bot"}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && <div className="ask-bubble bot">Assistant is typing...</div>}
          {error && <div className="alert alert-app-error p-2 m-0 mt-2">{error}</div>}
        </div>

        <div className="ask-popup-input">
          <input
            type="text"
            className="form-control"
            placeholder="Ask about products, orders..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) sendMessage(input);
            }}
            disabled={isTyping}
          />
          <button type="button" className="btn btn-app-primary" onClick={() => sendMessage(input)} disabled={!canSend}>
            Send
          </button>
        </div>
      </div>

      <button type="button" className="ask-popup-fab" onClick={() => setOpen((v) => !v)} aria-label="Open Ask AI chatbot">
        <i className="bi bi-chat-dots-fill me-2" />
        Ask AI
      </button>
    </>
  );
}

export default AskAIPopup;
