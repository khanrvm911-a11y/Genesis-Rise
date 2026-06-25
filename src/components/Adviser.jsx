import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Send, RotateCcw } from 'lucide-react';

const Adviser = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Genesis Rise. I'm Genesis System Adviser, your personal AI fitness coach. Whether your goal is building muscle, losing fat, improving athletic performance, or optimizing nutrition and recovery, I'm here to provide evidence-based guidance tailored to your goals. What would you like to work on today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sanitizeHtml = (text) => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError('');

    const safeContent = sanitizeHtml(trimmed);
    const userMsg = { role: 'user', content: safeContent };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chat service unavailable');
      }

      const data = await response.json();
      const sanitizedResponse = sanitizeHtml(data.message);

      setMessages((prev) => [...prev, { role: 'assistant', content: sanitizedResponse }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => { const copy = [...prev]; copy.pop(); return copy; });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-sl-gradient flex flex-col">
      <div className="px-4 pt-3 pb-2 text-center">
        <h1 className="text-lg font-bold gradient-text">Genesis System Adviser</h1>
        <p className="text-xs text-sl-gray-light">Your AI fitness coach — ask about training, nutrition, or recovery</p>
      </div>

      <div className="flex-1 mx-4 mb-3 bg-sl-dark/50 backdrop-blur-sm rounded-2xl border border-sl-purple/20 shadow-sl-glow flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 border-b border-sl-purple/15 bg-sl-dark/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-bold tracking-widest text-sl-purple-light uppercase">Coach: ACTIVE</span>
          </div>
          <button onClick={() => {
            setMessages([{ role: 'assistant', content: "Welcome to Genesis Rise. I'm Genesis System Adviser, your personal AI fitness coach. Whether your goal is building muscle, losing fat, improving athletic performance, or optimizing nutrition and recovery, I'm here to provide evidence-based guidance tailored to your goals. What would you like to work on today?" }]);
            setError('');
          }} className="text-red-400/60 hover:text-red-400 text-[10px] flex items-center gap-1 touch-target">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl border transition duration-300 ${
                msg.role === 'user'
                  ? 'bg-sl-purple/20 text-sl-purple-light border-sl-purple/40 shadow-sl-glow rounded-br-md'
                  : 'bg-sl-gray/20 text-white border-sl-purple/15 rounded-bl-md'
              }`}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1 opacity-60">
                  {msg.role === 'user' ? 'You' : '[GENESIS SYSTEM ADVISER]'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{sanitizeHtml(msg.content)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[88%] px-3.5 py-2.5 rounded-2xl bg-sl-gray/20 text-sl-purple-light border border-sl-purple/15 rounded-bl-md">
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1 opacity-60">[GENESIS COACH]</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sl-purple rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-sl-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-sl-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  <span className="text-xs text-sl-purple-light/60 ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="px-3.5 py-2.5 rounded-2xl bg-red-950/45 border border-red-500/30 text-red-300 text-xs max-w-xs text-center">
                Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-sl-purple/15 bg-sl-dark/40">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach..."
              className="flex-1 holo-input bg-sl-dark/60 text-white placeholder:text-gray-600 text-sm py-3"
              disabled={loading}
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="holo-button holo-button-primary w-12 h-12 p-0 flex items-center justify-center shrink-0 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Adviser;
