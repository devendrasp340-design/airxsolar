const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'airxsolar-secret-change-in-production-2024';

/**
 * Authenticate — verify JWT from httpOnly cookie
 */
function authenticate(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, full_name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Authorize — RBAC middleware factory
 * @param  {...string} roles  Allowed roles, e.g. 'owner', 'sales', 'content'
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
