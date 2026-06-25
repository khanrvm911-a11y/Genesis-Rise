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
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');

    const groqMessages = [
      {
        role: 'system',
        content: "Write a short direct answer to the user's fitness or nutrition question. Use plain text. No style. No flourishes. No names for the user. Just the answer."
      },
      ...(lastUserMsg ? [{ role: 'user', content: lastUserMsg.content }] : [])
    ];

    const temperature = 0.1;

    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: groqMessages,
      temperature,
      max_tokens: 300,
    });

    const text = completion?.choices?.[0]?.message?.content?.trim()
      || "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";

    res.json({ message: text });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(503).json({ error: 'AI service temporarily unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Genesis Rise backend server running on port ${PORT}`);
});
