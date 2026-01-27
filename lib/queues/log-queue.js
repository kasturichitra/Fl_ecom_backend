import { Queue } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";

export const logQueue = new Queue("log-queue", {
  connection: bullConnection,
});
