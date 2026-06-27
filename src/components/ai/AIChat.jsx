import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader, RefreshCw, MessageSquare } from 'lucide-react';
import {
  buildSystemPrompt, SUGGESTED_PROMPTS, PROMPT_TEMPLATES,
  addMessageToConversation, updateConversationTitle,
  saveConversations, createConversation,
  checkDailyLimit, incrementDailyCount, getLimitResetMessage,
} from '../../utils/coachUtils';
import { useOffline } from '../../context/OfflineContext';
import OfflineBanner from '../offline/OfflineBanner';

let abortController = null;

export default function AIChat({
  ctx, conversations, setConversations,
  activeId, setActiveId, onBack,
}) {
  const { isOnline } = useOffline();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationsRef = useRef(conversations);
  const activeConvRef = useRef(null);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streaming]);

  useEffect(() => {
    if (!streaming) inputRef.current?.focus();
  }, [streaming, activeId]);

  const persist = useCallback((convs, id) => {
    saveConversations({ conversations: convs, activeId: id });
    conversationsRef.current = convs;
    setConversations(convs);
    setActiveId(id);
  }, [setConversations, setActiveId]);

  const getOrCreateConversation = useCallback(() => {
    const convs = conversationsRef.current;
    const existing = convs.find(c => c.id === activeId);
    if (existing) return existing;
    const newConv = createConversation('New Chat');
    const newConvs = [...convs, newConv];
    persist(newConvs, newConv.id);
    activeConvRef.current = newConv;
    return newConv;
  }, [activeId, persist]);

  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || streaming) return;

    const limit = checkDailyLimit();
    if (!limit.allowed) {
      setError(getLimitResetMessage());
      return;
    }

    setError('');
    setStreamingContent('');

    const conv = (conversationsRef.current.find(c => c.id === activeId)) || getOrCreateConversation();
    const userMsg = content.trim();

    const convWithUser = addMessageToConversation(conv, 'user', userMsg);
    const updatedConvs = (conversationsRef.current || []).map(c => c.id === convWithUser.id ? convWithUser : c);
    const isFirstMsg = convWithUser.messages.length <= 1;

    if (isFirstMsg && userMsg.length < 60) {
      const titled = updateConversationTitle(convWithUser, userMsg);
      const titledConvs = updatedConvs.map(c => c.id === titled.id ? titled : c);
      persist(titledConvs, titled.id);
    } else {
      persist(updatedConvs, convWithUser.id);
    }

    setInput('');
    setStreaming(true);

    const chatMessages = convWithUser.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }));

    const systemPrompt = buildSystemPrompt(ctx);

    try {
      abortController = new AbortController();
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, systemPrompt }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              fullContent += data.content;
              setStreamingContent(fullContent);
            } else if (data.type === 'done') {
              incrementDailyCount();
              const finalConvs = conversationsRef.current;
              const finalConv = finalConvs.find(c => c.id === convWithUser.id) || convWithUser;
              const withResponse = addMessageToConversation(finalConv, 'assistant', fullContent);
              const resultConvs = finalConvs.map(c => c.id === withResponse.id ? withResponse : c);
              persist(resultConvs, withResponse.id);
              setStreamingContent('');
            } else if (data.type === 'error') {
              setError(data.content || 'Service unavailable');
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to get response. Please try again.');
      }
    } finally {
      setStreaming(false);
      setStreamingContent('');
      abortController = null;
      inputRef.current?.focus();
    }
  }, [streaming, ctx, activeId, getOrCreateConversation, persist]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (promptId) => {
    const template = PROMPT_TEMPLATES[promptId];
    if (template) {
      const message = typeof template === 'function' ? template(ctx) : template;
      sendMessage(message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape' && streaming) {
      abortController?.abort();
      setStreaming(false);
      setStreamingContent('');
    }
  };

  const newChat = () => {
    const convs = conversationsRef.current;
    const newConv = createConversation('New Chat');
    const newConvs = [...convs, newConv];
    persist(newConvs, newConv.id);
  };

  const suggestions = SUGGESTED_PROMPTS;

  const hasMessages = messages.length > 0 || streaming;

  if (!hasMessages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sl-purple-light" />
            AI Chat
          </h2>
          <button onClick={onBack}
            className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-sl-purple/10 border border-sl-purple/20 flex items-center justify-center mb-4">
            <Bot className="w-7 h-7 text-sl-purple-light" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Ask Your AI Coach</h3>
          <p className="text-xs text-sl-purple-light/60 mb-6 max-w-sm">
            Ask anything about fitness, nutrition, workouts, or recovery.
            Your coach knows your profile and progress.
          </p>

          {!isOnline && (
            <div className="w-full max-w-sm mb-4">
              <OfflineBanner type="ai_coach" />
            </div>
          )}

          {isOnline && (
            <>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {suggestions.slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => handlePromptClick(p.id)}
                    className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20 hover:bg-sl-gray/30 hover:border-sl-purple/25 transition text-left">
                    <p className="text-[11px] font-semibold text-white">{p.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2 w-full max-w-sm">
                {suggestions.slice(4).map(p => (
                  <button key={p.id} onClick={() => handlePromptClick(p.id)}
                    className="flex-1 rounded-xl p-2.5 border border-sl-purple/15 bg-sl-gray/20 hover:bg-sl-gray/30 hover:border-sl-purple/25 transition text-center">
                    <p className="text-[11px] font-semibold text-white">{p.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {isOnline ? (
          <form onSubmit={handleSubmit} className="shrink-0 mt-4">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Ask your coach anything..."
                className="flex-1 h-11 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-sm text-white placeholder-sl-purple-light/30 px-4 focus:outline-none focus:border-sl-purple/40 transition"
                disabled={streaming} />
              <button type="submit" disabled={!input.trim() || streaming}
                className="w-11 h-11 rounded-xl bg-sl-purple/20 border border-sl-purple/30 flex items-center justify-center text-sl-purple-light hover:bg-sl-purple/30 transition disabled:opacity-30">
                {streaming ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        ) : (
          <div className="shrink-0 mt-4 rounded-xl px-4 py-3 bg-sl-gray/15 border border-sl-purple/10 text-center">
            <p className="text-xs text-sl-purple-light/50">AI Coach is unavailable while offline</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack}
            className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition shrink-0">
            Back
          </button>
          <span className="text-xs text-sl-purple-light/40 mx-1">|</span>
          <span className="text-xs font-semibold text-white truncate">{activeConversation?.title || 'Chat'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={newChat}
            className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
            New Chat
          </button>
        </div>
      </div>

      <div ref={messagesEndRef} className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin" role="log" aria-label="Chat messages">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user'
                ? 'bg-sl-purple/15 border border-sl-purple/25'
                : 'bg-emerald-500/15 border border-emerald-500/20'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-sl-purple-light" />
                : <Bot className="w-3.5 h-3.5 text-emerald-400" />
              }
            </div>
            <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-sl-purple/15 border border-sl-purple/25 text-white'
                : 'bg-sl-gray/20 border border-sl-purple/15 text-white'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="max-w-[85%] rounded-xl p-3 bg-sl-gray/20 border border-sl-purple/15 text-sm leading-relaxed text-white">
              {streamingContent || (
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sl-purple-light/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sl-purple-light/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sl-purple-light/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-3 border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="shrink-0 mt-3">
        {!isOnline && (
          <div className="mb-3">
            <OfflineBanner type="ai_coach" />
          </div>
        )}

        {isOnline && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {suggestions.map(p => (
                <button key={p.id} onClick={() => handlePromptClick(p.id)}
                  disabled={streaming}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 border border-sl-purple/15 bg-sl-gray/20 text-[10px] font-semibold text-sl-purple-light/80 hover:bg-sl-gray/30 hover:text-white transition whitespace-nowrap disabled:opacity-30">
                  {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Ask your coach anything..."
                  className="flex-1 h-11 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-sm text-white placeholder-sl-purple-light/30 px-4 focus:outline-none focus:border-sl-purple/40 transition"
                  disabled={streaming || !isOnline} />
                <button type="submit" disabled={!input.trim() || streaming || !isOnline}
                  className="w-11 h-11 rounded-xl bg-sl-purple/20 border border-sl-purple/30 flex items-center justify-center text-sl-purple-light hover:bg-sl-purple/30 transition disabled:opacity-30"
                  aria-label="Send message">
                  {streaming
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
