import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend and admin panel local domains
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  credentials: true
}));

// Configure body parser limit for Base64 image uploads (e.g. 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Register routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Connect to MongoDB and start server
const mongoUri = process.env.MONGO_DB;
if (!mongoUri) {
  console.error('CRITICAL: MONGO_DB environment variable is not defined.');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
