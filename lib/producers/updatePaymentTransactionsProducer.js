import { updatePaymentTransactionsQueue } from "../queues/updatePaymentTransactionsQueue.js";

export const updatePaymentTransactions = async (payload) => {
  const job = await updatePaymentTransactionsQueue.add("update-payment-transactions-queue", payload, {});

  console.log("Update payment transactions job sent with id", job.id);
};
