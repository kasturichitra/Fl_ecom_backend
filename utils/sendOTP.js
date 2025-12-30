import axios from "axios";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const DOVE_SOFT_API_URL = process.env.DOVE_SOFT_API_URL;
const DOVE_SOFT_USER = process.env.DOVE_SOFT_USER;
const DOVE_SOFT_KEY = process.env.DOVE_SOFT_KEY;
const DOVE_SOFT_SENDERID = process.env.DOVE_SOFT_SENDERID;
const DOVE_SOFT_ENTITYID = process.env.DOVE_SOFT_ENTITYID;
const DOVE_SOFT_TEMPID = process.env.DOVE_SOFT_TEMPID;

// Function to send SMS using Dove Soft API
const sendSMS = async (mobileNumber, message) => {
  let config = {
    method: "get",
    url: `${DOVE_SOFT_API_URL}&user=${DOVE_SOFT_USER}&key=${DOVE_SOFT_KEY}&mobile=+91${mobileNumber}&message=${message}&senderid=${DOVE_SOFT_SENDERID}&accusage=1&entityid=${DOVE_SOFT_ENTITYID}&tempid=${DOVE_SOFT_TEMPID}`,
  };
  const response = await axios.request(config);
  return response.data;
};

// Create a reusable transporter object using SMTP
// Configure these via environment variables for security (e.g., using dotenv)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send email using Nodemailer
export const sendEmail = async (email, message, subject = "OTP Verification") => {
  const mailOptions = {
    from: `${process.env.SMTP_USER}`, // Sender address
    to: email, // Recipient
    subject: subject, // Subject line
    text: message, // Plain text body
    // html: `<p>${message}</p>`,                       // Optional: HTML body (uncomment if needed)
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export const sendMobileOTP = async (mobileNumber, otp) => {
  const message = `OTP: ${otp} for user verification - NTARBZ`;
  const response = await sendSMS(mobileNumber, message);
  return response;
};

export const sendEmailOTP = async (email, otp) => {
  const message = `Your OTP is ${otp}. Do not share with anyone.`;
  await sendEmail(email, message);
};

export const generateAndSendOtp = async (options = {}, otpDb) => {
  const {
    user_id,
    device_id,
    purpose,
    expiresAt = new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    email,
    phone_number,
  } = options;

  const otp = Math.floor(100000 + Math.random() * 900000);

  const otpHash = await bcrypt.hash(otp.toString(), 10);

  const response = await otpDb.create({
    user_id,
    device_id,
    purpose,
    expires_at: expiresAt,
    otp_hash: otpHash,
  });

  if (email) await sendEmailOTP(email, otp);
  if (phone_number) await sendMobileOTP(phone_number, otp);

  return {
    otp_id: response._id, // 🔥 THIS IS KEY
    expires_at: response.expires_at,
  };
};
