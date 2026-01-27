import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const updateTransactionAnalyticsQueue = new Queue(
    "update-transaction-analytics-queue",
    {
        connection: bullConnection,
    }
);