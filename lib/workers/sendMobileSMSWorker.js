// workers/sendOtpWorker.js
import { Worker } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";
import { sendSMS } from "../../utils/sendOTP.js";

const sendMobileSMSWorker = new Worker(
  "send-mobile-sms-queue",
  async (job) => {
    try {
      const { mobileNumber, message } = job.data;

      if (!mobileNumber || !message) {
        throw new Error("Invalid OTP payload");
      }

      const result = await sendSMS(mobileNumber, message);

      console.log("OTP SMS sent:", mobileNumber, result);
      return result;
    } catch (error) {
      console.error("OTP worker error:", error.message);
      throw error;
    }
  },
  {
    connection: bullConnection,
    concurrency: 10,
  },
);

sendMobileSMSWorker.on("completed", (job) => {
  console.log("✅ OTP job completed:", job.id);
});

sendMobileSMSWorker.on("failed", (job, err) => {
  console.log("❌ OTP job failed:", job.id, err.message);
});

console.log("📩 Send OTP worker started...");
