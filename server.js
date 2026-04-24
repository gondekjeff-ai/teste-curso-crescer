import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './server/db.js';
import { registerApiRoutes } from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || '21002', 10);
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
  },
  bodyLimit: 10 * 1024 * 1024,
  trustProxy: true,
  disableRequestLogging: false,
});

// Security: hide framework header
app.addHook('onSend', async (req, reply, payload) => {
  reply.header('x-powered-by', undefined);
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  return payload;
});

await app.register(fastifyCors, {
  origin: true,
  credentials: true,
});

// Health check
app.get('/health', async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  env: process.env.NODE_ENV || 'production',
}));

// API routes (registers /api/* + /api/admin/upload via @fastify/multipart)
await app.register(registerApiRoutes, { pool, prefix: '/api' });

// Serve compiled SPA from dist/
await app.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'),
  prefix: '/',
  maxAge: '1d',
  etag: true,
  lastModified: true,
  decorateReply: true,
});

// SPA catch-all: any non-API GET returns index.html so React Router handles it
app.setNotFoundHandler((request, reply) => {
  if (request.method !== 'GET') {
    return reply.code(405).send({ error: 'Method not allowed' });
  }
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({ message: 'Endpoint não encontrado' });
  }
  return reply.sendFile('index.html');
});

// Crash safety
process.on('uncaughtException', (err) => {
  app.log.error({ err }, 'uncaughtException');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  app.log.error({ reason }, 'unhandledRejection');
  process.exit(1);
});

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`✅ Fastify server running on http://${HOST}:${PORT}`);
  console.log(`   Health:  http://${HOST}:${PORT}/health`);
  console.log(`   API:     http://${HOST}:${PORT}/api`);
  console.log(`   Admin:   http://${HOST}:${PORT}/admin/login`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}