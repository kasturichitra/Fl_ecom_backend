// queues/sendOtpQueue.js
import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const sendMobileSMSQueue = new Queue("send-mobile-sms-queue", {
  connection: bullConnection,
});
