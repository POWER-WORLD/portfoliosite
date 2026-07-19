import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import apiRoutes from './routes/index.js';

dotenv.config();

// Strict environment validation checks on server startup
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'JWT_SECRET'.");
  process.exit(1);
}

// Log warning for optional Supabase variables
const optionalEnv = ['SUPABASE_DB_URL', 'SUPABASE_DB_KEY', 'SUPABASE_BUCKET'];
const missingOptional = optionalEnv.filter(key => !process.env[key]);
if (missingOptional.length > 0) {
  console.warn(`[Warning] Missing optional environment variables: ${missingOptional.join(', ')}. Some file upload services might be limited.`);
}

const app = express();
app.use(compression());
const PORT = process.env.PORT || 5000;

// Enable CORS for development and production domains dynamically
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://pawankumar.info',
  'https://www.pawankumar.info',
  'http://pawankumar.info',
  'http://www.pawankumar.info'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ''));
}
if (process.env.ADMIN_URL) {
  allowedOrigins.push(process.env.ADMIN_URL.trim().replace(/\/$/, ''));
}
if (process.env.ALLOWED_ORIGINS) {
  const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''));
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      return allowed.toLowerCase() === cleanOrigin.toLowerCase();
    }) || 
    cleanOrigin.endsWith('.onrender.com') ||
    cleanOrigin.endsWith('.pawankumar.info') ||
    cleanOrigin.includes('pawankumar.info');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Request from origin ${origin} not matched.`);
      callback(null, false);
    }
  },
  credentials: true
}));

// Configure body parser limit for Base64 image & document uploads (e.g. 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// 404 Route Not Found fallback handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'API Route Not Found' });
});

// Global error handler (ensures CORS headers are preserved even on 500 errors)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
const mongoUri = process.env.MONGO_DB || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('CRITICAL: Neither MONGO_DB nor MONGODB_URI environment variable is defined.');
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
    process.exit(1);
  });
