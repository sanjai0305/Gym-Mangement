import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { getDatabaseStatus } from './config/db';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Configure CORS
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS security policy.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory if needed
app.use('/uploads', express.static('uploads'));

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint with accurate database reporting
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'healthy',
    service: 'FITCORE Gym Management SaaS',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.isConnected,
      engine: dbStatus.isConnected ? 'MongoDB Mongoose' : 'Resilient File Storage Fallback',
      targetUri: dbStatus.uri ? dbStatus.uri.replace(/:([^:@]{3,})@/, ':***@') : 'local',
      notice: dbStatus.error || null,
    },
  });
});

// Mount API routes with /api prefix
app.use('/api', apiRouter);

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[FITCORE Error Handler]', err.message || err);
  const status = Number(err.status || err.statusCode) || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred. Please try again.',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
