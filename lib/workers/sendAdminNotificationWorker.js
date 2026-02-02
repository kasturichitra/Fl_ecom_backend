import { Worker } from "bullmq";
import { sendAdminNotification } from "../../utils/notificationHelper.js";
import { bullConnection } from "../bullmq/bullmqConnection.js";

/*
    Example JSON
    {
        id: "Auto Generated Id",
        data: {
            tenantId: "tenant_id",
            adminId: "admin_id",
            data: {
            }    
        }
    }
*/
const sendAdminNotificationWorker = new Worker(
  "send-admin-notification-queue",
  async (job) => {
    try {
      const { tenantId, adminId = "", data } = job?.data;
      await sendAdminNotification(tenantId, adminId, data);
    } catch (error) {
      console.error("Send admin notification worker error:", error.message);
      throw error;
    }
  },
  {
    connection: bullConnection,
    concurrency: 10,
  },
);

sendAdminNotificationWorker.on("completed", (job) => {
  console.log("Send admin notification job completed with id", job.id);
});

sendAdminNotificationWorker.on("failed", (job) => {
  console.log("Send admin notification job failed with id", job.id);
});

console.log("Send admin notification worker started......");
