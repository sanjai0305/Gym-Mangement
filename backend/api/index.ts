import app from '../src/app';
import { connectDatabase } from '../src/config/db';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // Ensure cached MongoDB Atlas connection
  await connectDatabase();
  return app(req, res);
}
