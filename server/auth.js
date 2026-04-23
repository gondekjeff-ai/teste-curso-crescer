import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'optistrat-change-this-in-production';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Fastify preHandler hook: verifies Bearer JWT and sets request.user
 */
export async function authHook(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Token não fornecido' });
  }
  try {
    request.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    return reply.code(401).send({ message: 'Token inválido ou expirado' });
  }
}