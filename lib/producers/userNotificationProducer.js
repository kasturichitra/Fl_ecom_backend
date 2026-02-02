// producers/userNotificationProducer.js
import { userNotificationQueue } from "../queues/userNotificationQueue.js";

export const addUserNotificationJob = async (
  tenantID,
  userId,
  data,
) => {
  await userNotificationQueue.add(
    "user-notification-queue",
    {
      tenantID,
      userId,
      data,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};
