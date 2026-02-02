// workers/sendOtpWorker.js
import { Worker } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";
import { sendSMS } from "../../utils/sendOTP.js";
// import { sendSMS } from "../services/smsService.js";

// services/smsService.js
// import axios from "axios";

// const DOVE_SOFT_API_URL = process.env.DOVE_SOFT_API_URL;
// const DOVE_SOFT_USER = process.env.DOVE_SOFT_USER;
// const DOVE_SOFT_KEY = process.env.DOVE_SOFT_KEY;
// const DOVE_SOFT_SENDERID = process.env.DOVE_SOFT_SENDERID;
// const DOVE_SOFT_ENTITYID = process.env.DOVE_SOFT_ENTITYID;
// const DOVE_SOFT_TEMPID = process.env.DOVE_SOFT_TEMPID;

// export const sendSMS = async (mobileNumber, message) => {
//   const config = {
//     method: "get",
//     url: `${DOVE_SOFT_API_URL}&user=${DOVE_SOFT_USER}&key=${DOVE_SOFT_KEY}&mobile=+91${mobileNumber}&message=${encodeURIComponent(
//       message
//     )}&senderid=${DOVE_SOFT_SENDERID}&accusage=1&entityid=${DOVE_SOFT_ENTITYID}&tempid=${DOVE_SOFT_TEMPID}`,
//   };

//   const response = await axios.request(config);
//   return response.data;
// };


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
  }
);

sendMobileSMSWorker.on("completed", (job) => {
  console.log("✅ OTP job completed:", job.id);
});

sendMobileSMSWorker.on("failed", (job, err) => {
  console.log("❌ OTP job failed:", job.id, err.message);
});

console.log("📩 Send OTP worker started...");
