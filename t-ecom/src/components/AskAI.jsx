import { useEffect, useState, useCallback } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';

const QUICK_PROMPTS = [
  'Summarize laptops in the catalog',
  'What categories do you have?',
  'Suggest a gift under $100',
  'How do I add a new product?',
];

function AskAi() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_URL ?? 'http://localhost:8080';

  useEffect(() => {
    setMessages([
      {
        message: "Hi — I'm GPM EcomAI Bot. Ask about products, orders, or anything in the store.",
        sender: 'AI',
        direction: 'incoming'
      }
    ]);
  }, []);

  const processMessageToChatGPT = async (chatMessage) => {
    const url = `${baseUrl}/api/chat/ask?message=${encodeURIComponent(chatMessage)}`;

    const response = await fetch(url, {
      method: 'GET'
    });

    if (!response.ok) {
      let errMsg = 'Failed to get response from GPM EcomAI Bot';
      try {
        const errorData = await response.json();
        errMsg = errorData.error?.message || errorData.message || errMsg;
      } catch {
        try {
          errMsg = await response.text();
        } catch { /* ignore */ }
      }
      throw new Error(errMsg);
    }

    let botMessageText;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      botMessageText = typeof data === 'string'
        ? data
        : (data.response ?? JSON.stringify(data));
    } else {
      botMessageText = await response.text();
    }

    setMessages(prev => [
      ...prev,
      {
        message: botMessageText,
        sender: 'ChatGPT',
        direction: 'incoming'
      }
    ]);
  };

  const handleSend = useCallback(async (messageText) => {
    const text = typeof messageText === 'string' ? messageText : '';
    if (!text.trim()) return;

    setError(null);
    const userMessage = {
      message: text,
      sender: 'user',
      direction: 'outgoing'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await processMessageToChatGPT(text);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsTyping(false);
    }
  }, []);

  return (
    <div className="page-shell container px-3">
      <div
        className="ask-ai-host surface-card d-flex flex-column"
        style={{ height: 'min(82vh, 720px)' }}
      >
        <div className="ask-ai-hero flex-shrink-0">
          <h1>
            <i className="bi bi-stars me-2" aria-hidden />
            Ask AI
          </h1>
          <p>Quick answers about your shop — try a suggestion or type your own question.</p>
        </div>

        <div className="ask-ai-quick flex-shrink-0">
          {QUICK_PROMPTS.map((label) => (
            <button
              key={label}
              type="button"
              className="quick-chip border-0"
              disabled={isTyping}
              onClick={() => handleSend(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-app-error d-flex align-items-center justify-content-between flex-shrink-0" role="alert">
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill" aria-hidden />
              {error}
            </span>
            <button type="button" className="btn btn-sm btn-app-ghost py-0 border-0" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-grow-1 position-relative" style={{ minHeight: '260px' }}>
          <MainContainer style={{ position: 'absolute', inset: 0, height: '100%' }}>
            <ChatContainer style={{ height: '100%' }}>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={isTyping ? <TypingIndicator content="Assistant is thinking…" /> : null}
              >
                {messages.map((m, i) => (
                  <Message key={i} model={m} />
                ))}
              </MessageList>

              <MessageInput
                placeholder="Message the assistant…"
                onSend={handleSend}
                attachButton={false}
                disabled={isTyping}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </div>
  );
}

export default AskAi;
