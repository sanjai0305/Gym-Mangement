import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/db';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🚀 FITCORE API Server running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('Stopping FITCORE API server gracefully...');
      server.close(() => {
        console.log('Server process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

startServer();
