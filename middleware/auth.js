const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token:', token); // Log the raw token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Log the decoded payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message); // Log error details
    res.status(401).json({ message: 'Token is invalid', error: error.message });
  }
};

module.exports = authMiddleware;