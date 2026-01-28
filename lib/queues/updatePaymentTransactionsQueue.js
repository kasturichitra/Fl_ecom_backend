import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const updatePaymentTransactionsQueue = new Queue(
    "update-payment-transactions-queue",
    {
        connection: bullConnection,
    }
);