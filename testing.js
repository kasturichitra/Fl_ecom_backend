import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { getTenantConnection } from "../utils/tenantHandler.js";
import { addPayinTransactionCount } from "../utils/payinTransactions.js";
import { getPaidDLQQueue } from "../queues/analytics.queue.js";
import { addPayoutTransactionDetails } from "../utils/payoutTransactions.js";
import { handlAuditing } from "../utils/audit.utils.js";

// MAIN QUEUE worker
export const analyticsWorker = new Worker(
  "analytics_queue",
  async (job) => {
    const payload = job.data;
    const { type, data } = payload;

    console.log("payload ==>>>", JSON.stringify(payload));
    const { tenantId } = data;
    console.log("tenantId ==>>>", tenantId);
    try {
      const dbConnection = await getTenantConnection(tenantId);

      switch (type?.toUpperCase()) {
        case "PAYOUT":
          await addPayoutTransactionDetails(dbConnection, data);
          console.log("PAYOUT settlement processed successfully");
          break;

        case "PAYIN":
          await addPayinTransactionCount(dbConnection, data);
          console.log("ANALYTICS processed successfully");
          break;
        case "WALLET_AUDIT":
          await handlAuditing(dbConnection, data)
          console.log("ANALYTICS processed successfully");
          break;

        default:
          console.warn("Unknown job type:", type);
          break;
      }
      return { ok: true };
    } catch (err) {
      console.error("Wallet call failed:", err);
      console.error("Wallet call failed:", err.message);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
    lockDuration: 1000 * 60 * 5,
  }
);

analyticsWorker.on("ready", () => {
  console.log(
    ":rocket: analytics Worker started & listening to queue → analytics_queue"
  );
});

// Worker Events
analyticsWorker.on("completed", (job) =>
  console.log(`Get paid worker complete → ${job.id}`)
);

analyticsWorker.on("failed", async (job, err) => {
  console.log(`:x: Job failed → ${job.id}: ${err.message}`);

  const maxAttemptsReached = job.attemptsMade >= job.opts.attempts;

  if (maxAttemptsReached) {
    console.log(`Moving job ${job.id} to DLQ`);

    await getPaidDLQQueue.add("analytics-dlq", {
      failedType: job.data.type, // AUDIT / GET_PAID / ANY
      originalQueue: "analytics_queue",
      failedAt: new Date(),
      attemptsMade: job.attemptsMade,
      jobData: job.data, // original job payload
      error: err.message, // error message
    });
  }
});