import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authorization error' });
  }
};

export default authMiddleware;
