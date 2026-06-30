import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Hello/Status check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Backend service is online.' });
});

// Contact endpoint - saves form submission to MongoDB
app.post('/api/messages', async (req: Request, res: Response) => {
  const { name, email, content } = req.body;

  if (!name || !email || !content) {
    return res.status(400).json({ error: 'Name, email, and message content are required.' });
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        content,
      },
    });

    console.log(`✉️ New contact message received from ${name} (${email})`);
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving contact message:', error);
    return res.status(500).json({ error: 'Failed to save contact message.' });
  }
});

// Fallback Route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend server running on http://localhost:${PORT}`);
});
