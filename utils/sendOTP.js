import axios from "axios";
import nodemailer from "nodemailer";

const DOVE_SOFT_API_URL = process.env.DOVE_SOFT_API_URL;
const DOVE_SOFT_USER = process.env.DOVE_SOFT_USER;
const DOVE_SOFT_KEY = process.env.DOVE_SOFT_KEY;
const DOVE_SOFT_SENDERID = process.env.DOVE_SOFT_SENDERID;
const DOVE_SOFT_ENTITYID = process.env.DOVE_SOFT_ENTITYID;
const DOVE_SOFT_TEMPID = process.env.DOVE_SOFT_TEMPID;

// Function to send SMS using Dove Soft API
const sendSMS = async (mobileNumber, message) => {
  try {
    let config = {
      method: "get",
      url: `${DOVE_SOFT_API_URL}&user=${DOVE_SOFT_USER}&key=${DOVE_SOFT_KEY}&mobile=+91${mobileNumber}&message=${message}&senderid=${DOVE_SOFT_SENDERID}&accusage=1&entityid=${DOVE_SOFT_ENTITYID}&tempid=${DOVE_SOFT_TEMPID}`,
    };
    const response = await axios.request(config);
    console.log("Response data from Send SMS API:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

// Create a reusable transporter object using SMTP
// Configure these via environment variables for security (e.g., using dotenv)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send email using Nodemailer
export const sendEmail = async (email, message, subject = "OTP Verification") => {
  try {
    const mailOptions = {
      from: `"Your App Name" <${process.env.SMTP_USER}>`, // Sender address
      to: email, // Recipient
      subject: subject, // Subject line
      text: message, // Plain text body
      // html: `<p>${message}</p>`,                       // Optional: HTML body (uncomment if needed)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendMobileOTP = async (mobileNumber, otp) => {
  try {
    const hashcode = Math.random().toString(36).substring(2, 15);
    const message = `OTP: ${otp}  ${hashcode} for user verification - NTARBZ`;
    const response = await sendSMS(mobileNumber, message);
    console.log("Response in sendMobileOTP:", response);
    return response; 
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const sendEmailOTP = async (email, otp) => {
  try {
    const message = `Your OTP is ${otp}. Do not share with anyone.`;
    await sendEmail(email, message);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};
