import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './server/db.js';
import { createApiRoutes } from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 21002;
const DATABASE_URL = "postgresql://optistrat:FuEO4FYYOAl1QaVmZWRh@pgsql.optistrat.com.br:5432/optistrat";
const DB_SSL = false || false;
const JWT_SECRET = "e03cffff9615e89004c87369246c4871a80285596e127457e72a9728c2309068"
const NODE_ENV = "production"

// (Opcional) API Keys
//RESEND_API_KEY=
//GROQ_API_KEY=

// Security
app.disable('x-powered-by');

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'production'
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// API routes
app.use('/api', createApiRoutes(pool));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// SPA catch-all
app.use((req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
