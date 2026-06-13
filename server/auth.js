import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  // Fail fast: never sign tokens with a weak/default secret.
  throw new Error('JWT_SECRET environment variable must be set to a strong value (>= 32 chars).');
}
export const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Fastify preHandler hook: verifies Bearer JWT and sets request.user.
 * SECURITY: Rejects pre-MFA tokens (mfa_pending=true). Those are only valid
 * for the dedicated /auth/verify-mfa endpoint, which verifies them directly.
 */
export async function authHook(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    if (decoded && decoded.mfa_pending === true) {
      return reply.code(401).send({ message: 'MFA pendente. Conclua a verificação para acessar.' });
    }
    request.user = decoded;
  } catch {
    return reply.code(401).send({ message: 'Token inválido ou expirado' });
  }
}