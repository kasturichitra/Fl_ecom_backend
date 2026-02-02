// queues/userNotificationQueue.js
import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const userNotificationQueue = new Queue(
  "user-notification-queue",
  { connection: bullConnection }
);
