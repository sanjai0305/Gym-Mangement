import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { connectDatabase, getDatabaseStatus } from './config/db';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Configure CORS
const allowedOrigins = [
  CLIENT_URL,
  'https://gym-mangement-opal.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    // Deny origin safely without crashing Express with an unhandled throw
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serverless database connection assurance middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn('[Database Middleware] Notice during connection check:', err);
  }
  next();
});

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint with standard JSON contract
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    success: true,
    message: 'FITCORE API is running',
    data: {
      status: 'healthy',
      service: 'FITCORE Gym Management SaaS',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbStatus.isConnected,
        engine: dbStatus.isConnected ? 'MongoDB Atlas / Mongoose' : 'Resilient File Storage Fallback',
        targetUri: dbStatus.uri ? dbStatus.uri.replace(/:([^:@]{3,})@/, ':***@') : 'local',
        notice: dbStatus.error || null,
      },
    },
  });
});

// Mount API routes with /api prefix
app.use('/api', apiRouter);

// Fallback 404 handler for unknown routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    errors: [`Route ${req.originalUrl} does not exist.`],
  });
});

// Centralized error handler with standard JSON contract
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[FITCORE Error Handler]', err.message || err);
  const status = Number(err.status || err.statusCode) || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred. Please try again.',
    errors: err.errors || [err.message || 'Server error'],
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
