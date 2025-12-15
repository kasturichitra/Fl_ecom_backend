import jwt from "jsonwebtoken";
import { jwtSecret } from "../env.js";

const generateTokenAndSetCookie = (res, id) => {
  const token = jwt.sign({ id }, jwtSecret, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,          // prevents XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",      // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateTokenAndSetCookie;
