import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000,
  maxRetries: 0,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const groqMessages = [
      {
        role: 'system',
        content: systemPrompt || "You are Genesis AI Coach, a knowledgeable and supportive fitness coach. Provide concise, actionable advice based on the user's profile. Use plain text. Be encouraging but honest. Never provide medical diagnoses or recommend unsafe practices. Always encourage consulting qualified professionals for medical concerns."
      },
      ...messages.slice(-20)
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.3,
      max_tokens: 600,
    });

    const text = completion?.choices?.[0]?.message?.content?.trim()
      || "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";

    res.json({ message: text });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(503).json({ error: 'AI service temporarily unavailable' });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const groqMessages = [
      {
        role: 'system',
        content: systemPrompt || "You are Genesis AI Coach, a knowledgeable and supportive fitness coach. Provide concise, actionable advice based on the user's profile. Use plain text. Be encouraging but honest. Never provide medical diagnoses or recommend unsafe practices. Always encourage consulting qualified professionals for medical concerns."
      },
      ...messages.slice(-20)
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
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Stream error:', err.message);
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'AI service temporarily unavailable' })}\n\n`);
      res.end();
    } catch {}
  }
});

app.listen(PORT, () => {
  console.log(`Genesis Rise backend server running on port ${PORT}`);
});
