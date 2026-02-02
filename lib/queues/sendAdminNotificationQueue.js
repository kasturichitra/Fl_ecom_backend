import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const sendAdminNotificationQueue = new Queue("send-admin-notification-queue", {
  connection: bullConnection,
});
