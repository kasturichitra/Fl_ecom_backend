import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'failed',
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
   
    if (!decoded) {
      return res.status(401).json({
      status: 'failed',
      message: 'Access denied.  invalid token.'
    });
    }
    next();
  } catch (error) {
    console.log('token error====>', error);

    return res.status(401).json({
      status: 'failed',
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

export default verifyToken;
