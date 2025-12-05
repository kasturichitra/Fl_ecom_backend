import dotenv from 'dotenv';
dotenv.config();


export const mongoUri = process.env.MONGODB_URL;
export const port_number = process.env.PORT;
export const jwtSecret=process.env.JWT_SECRET

export const smtpUser=process.env.SMTP_USER
export const smtpPass=process.env.SMTP_PASS
