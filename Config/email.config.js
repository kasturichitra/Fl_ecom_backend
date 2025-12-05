import nodemailer from "nodemailer";
import { smtpUser, smtpPass } from "../env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});
