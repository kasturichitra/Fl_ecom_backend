import { sendAdminNotificationQueue } from "../queues/sendAdminNotificationQueue.js";

export const sendAdminNotificationProducer = async (tenantId, adminId, payload) => {
  const job = await sendAdminNotificationQueue.add("send-admin-notification-queue", { tenantId, adminId, data: payload }, {});

  console.log("Send admin notification job sent with id", job.id);
};
