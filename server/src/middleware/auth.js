import { verifyAccessToken } from '../utils/tokens.js';
import { fail } from '../utils/response.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return fail(res, 'Missing access token', 401);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}
