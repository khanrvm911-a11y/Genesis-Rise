import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

const Adviser = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome, champion. I am the System Advisor. Direct your Wish toward workouts, combat parameters, optimal nutrition, or recovery paths.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
      setMessages((prev) => {
        const copy = [...prev];
        copy.pop();
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-wide uppercase gradient-text mb-2 animate-pulse-slow">
          System Advisor Terminal
        </h1>
        <p className="text-sl-gray-light max-w-2xl mx-auto text-sm md:text-base">
          Establish a link with the System database to consult on training techniques, recovery methods, or general stat leveling.
        </p>
      </div>

      <div className="bg-sl-dark/50 backdrop-blur-sm rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col h-[65vh]">
        <div className="p-4 border-b border-sl-purple/15 bg-sl-dark/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold tracking-widest text-sl-purple-light uppercase">Advisor Node: ACTIVE</span>
          </div>
          <span className="text-xxs font-mono text-sl-purple-light/50">SECURE LINK // 256-BIT</span>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-sl-lg border transition duration-300 ${
                  msg.role === 'user'
                    ? 'bg-sl-purple/20 text-sl-purple-light border-sl-purple/40 shadow-sl-glow'
                    : 'bg-sl-gray/20 text-white border-sl-purple/15'
                }`}
              >
                <div className="text-xxs uppercase tracking-wider font-bold mb-1.5 opacity-60">
                  {msg.role === 'user' ? 'Champion' : '[SYSTEM ADVISOR]'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{sanitizeHtml(msg.content)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-sl-lg bg-sl-gray/20 text-sl-purple-light border border-sl-purple/15 animate-pulse">
                <div className="text-xxs uppercase tracking-wider font-bold mb-1 opacity-60">[ADVISOR STATUS]</div>
                <div className="text-sm">Accessing system database logs...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="px-4 py-3 rounded-sl-lg bg-red-950/45 border border-red-500/30 text-red-300 text-sm max-w-md text-center shadow-lg">
                <span className="font-bold uppercase tracking-wider block mb-1">SYSTEM LINK EXCEPTION</span>
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-sl-purple/15 bg-sl-dark/40">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input Wish for the Advisor..."
              className="flex-1 holo-input bg-sl-dark/60 text-white placeholder:text-gray-600 focus:text-white"
              disabled={loading}
              maxLength={2000}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="holo-button py-2.5 px-6 font-bold uppercase tracking-wider text-xs md:text-sm shadow-sl-glow-purple flex-1 md:flex-none text-center"
              >
                {loading ? 'Transmitting...' : 'As you wish Champion'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      role: 'assistant',
                      content: "Welcome, Champion. I am the System Advisor. Direct queries toward workouts, combat parameters, optimal nutrition, or recovery paths.",
                    },
                  ]);
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2.5 rounded-sl-lg text-xs font-bold uppercase tracking-wider transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Adviser;
