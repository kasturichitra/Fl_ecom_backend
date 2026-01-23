import dotenv from "dotenv";
dotenv.config();

export const mongoUri = process.env.MONGODB_URL;
export const port_number = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET;

export const redisHost = process.env.REDIS_HOST;
export const redisPort = process.env.REDIS_PORT;
export const redisPassword = process.env.REDIS_PASSWORD;

export const smtpUser = process.env.SMTP_USER;
export const smtpPass = process.env.SMTP_PASS;

export const couponAlphabet = process.env.COUPON_ALPHABET;
export const gstinVerifyUrl = process.env.GSTIN_VERIFY_URL;
