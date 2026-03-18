import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'optistrat-change-this-in-production';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
