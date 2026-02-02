// workers/userNotificationWorker.js
import { Worker } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";
import { sendUserNotification } from "../../utils/notificationHelper.js";
// import { sendUserNotification } from "../services/sendUserNotification.js";

const userNotificationWorker = new Worker(
  "user-notification-queue",
  async (job) => {
    const { tenantID, userId, data } = job.data;

    if (!tenantID || !userId || !data?.title) {
      throw new Error("Invalid notification payload");
    }

    return await sendUserNotification(tenantID, userId, data);
  },
  {
    connection: bullConnection,
    concurrency: 20,
  }
);

userNotificationWorker.on("completed", (job) => {
  console.log("✅ Notification job done:", job.id);
});

userNotificationWorker.on("failed", (job, err) => {
  console.log("❌ Notification job failed:", job.id, err.message);
});

console.log("🔔 User notification worker started");
