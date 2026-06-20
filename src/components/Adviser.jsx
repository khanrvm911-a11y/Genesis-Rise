import { useState } from 'react';

const Adviser = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome, Master. I am the System Advisor. Direct your Wish toward workouts, combat parameters, optimal nutrition, or recovery paths.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError('');

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];

    // Add user message to state
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      }

      // Convert messages to Gemini format
      const geminiContents = updatedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API reMission failed');
      }

      const data = await response.json();
      const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (err) {
      setError(err.message);
      // Remove the user message we added on error to avoid confusion
      setMessages((prev) => {
        const copy = [...prev];
        copy.pop(); // remove last user message
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
        {/* Terminal Header */}
        <div className="p-4 border-b border-sl-purple/15 bg-sl-dark/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold tracking-widest text-sl-purple-light uppercase">Advisor Node: ACTIVE</span>
          </div>
          <span className="text-xxs font-mono text-sl-purple-light/50">SECURE LINK // 256-BIT</span>
        </div>

        {/* Chat messages */}
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
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-sl-lg bg-sl-gray/20 text-sl-purple-light border border-sl-purple/15 animate-pulse">
                <div className="text-xxs uppercase tracking-wider font-bold mb-1 opacity-60">[ADVISOR STATUS]</div>
                <div className="text-sm">Accessing system database logs...</div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="px-4 py-3 rounded-sl-lg bg-red-950/45 border border-red-500/30 text-red-300 text-sm max-w-md text-center shadow-lg">
                <span className="font-bold uppercase tracking-wider block mb-1">⚠️ SYSTEM LINK EXCEPTION</span>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <div className="p-4 border-t border-sl-purple/15 bg-sl-dark/40">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input Wish for the Advisor..."
              className="flex-1 holo-input bg-sl-dark/60 text-white placeholder:text-gray-600 focus:text-white"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="holo-button py-2.5 px-6 font-bold uppercase tracking-wider text-xs md:text-sm shadow-sl-glow-purple flex-1 md:flex-none text-center"
              >
                {loading ? 'Transmitting...' : 'As you wish Champion'}
              </button>
              
              {/* Clear chat button */}
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

      {/* API key reminder if missing */}
      {!import.meta.env.VITE_GEMINI_API_KEY && (
        <div className="mt-4 p-4 bg-sl-purple/10 border border-sl-purple/35 rounded-sl-lg text-sl-purple-light text-center text-xs md:text-sm shadow-sl-glow">
          ⚠️ <span className="font-bold uppercase">Database Decryption Offline:</span> Create a <code className="bg-sl-dark px-1.5 py-0.5 rounded text-white border border-sl-purple/10">.env</code> file with <code className="bg-sl-dark px-1.5 py-0.5 rounded text-white border border-sl-purple/10">VITE_GEMINI_API_KEY=your_key</code> to decrypt system answers.
        </div>
      )}
    </div>
  );
};

export default Adviser;