import jwt from 'jsonwebtoken';

/**
 * JWT認証ミドルウェア
 * Authorization: Bearer <token> からトークンを検証
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" から TOKEN を取得

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = decoded; // { userId, name, picture }
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * オプショナルな認証ミドルウェア
 * トークンがあれば検証、なければスキップ
 */
export function optionalAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }

  next();
}
