import jwt from 'jsonwebtoken';
import { jwtSecret } from '../env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

export default generateToken;
