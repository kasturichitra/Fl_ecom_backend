import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const sendEmailQueue = new Queue("send-email-queue", {
  connection: bullConnection,
});
