import { updateTransactionAnalyticsQueue } from "../queues/updateTransactionAnalyticsQueue.js";

export const updateTransactionAnalytics = async (payload) => {
  const job = await updateTransactionAnalyticsQueue.add(
    "update-transaction-analytics-queue",
    payload,
    {},
  );

  console.log("Update transaction analytics job sent with id", job.id);

  // process.exit(0); 
};
