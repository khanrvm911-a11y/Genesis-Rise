import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];
const rawAllowed = process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawAllowed
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : (isProduction ? [] : DEFAULT_ALLOWED_ORIGINS);
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (isProduction && corsOrigins.length === 0) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '128kb' }));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000,
  maxRetries: 0,
});

const SYSTEM_PROMPT = "You are Genesis AI Coach, a knowledgeable and supportive fitness coach. Provide concise, actionable advice based on the user's profile. Use plain text. Be encouraging but honest. Never provide medical diagnoses or recommend unsafe practices. Always encourage consulting qualified professionals for medical concerns.";

async function requireAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: 'Authentication is not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' });

  req.user = data.user;
  next();
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return null;

  const normalized = messages.slice(-20).map(message => {
    const role = message?.role === 'assistant' ? 'assistant' : message?.role === 'user' ? 'user' : null;
    const content = typeof message?.content === 'string' ? message.content.trim() : '';
    if (!role || !content || content.length > 5000) return null;
    return { role, content };
  });

  if (normalized.some(message => !message)) return null;
  return normalized;
}

app.post('/api/chat', chatLimiter, requireAuth, async (req, res) => {
  const abortController = new AbortController();
  const serverTimeout = setTimeout(() => abortController.abort(), 55000);

  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages) {
      clearTimeout(serverTimeout);
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    const groqMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.3,
      max_tokens: 600,
    });

    clearTimeout(serverTimeout);
    const text = completion?.choices?.[0]?.message?.content?.trim()
      || "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";

    res.json({ message: text });
  } catch (err) {
    clearTimeout(serverTimeout);
    console.error('Chat error:', err.message);
    const isRateLimit = err.status === 429 || err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('limit');
    res.status(isRateLimit ? 429 : 503).json({ error: isRateLimit ? "Today's limit exceeded" : 'AI service temporarily unavailable' });
  }
});

app.post('/api/chat/stream', chatLimiter, requireAuth, async (req, res) => {
  const abortController = new AbortController();
  const serverTimeout = setTimeout(() => abortController.abort(), 55000);

  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages) {
      clearTimeout(serverTimeout);
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    const groqMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.3,
      max_tokens: 600,
      stream: true,
    }, { signal: abortController.signal });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
      }
    }

    clearTimeout(serverTimeout);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    clearTimeout(serverTimeout);
    console.error('Stream error:', err.message);
    try {
      const isAborted = err.name === 'AbortError';
      const isRateLimit = err.status === 429 || err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('limit');
      const errorMessage = isAborted ? 'Request timed out' : isRateLimit ? "Today's limit exceeded" : 'AI service temporarily unavailable';
      res.write(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`);
      res.end();
    } catch {
      /* ignore write/end errors */
    }
  }
});

app.listen(PORT, () => {
  console.log(`Genesis Rise backend server running on port ${PORT}`);
});
