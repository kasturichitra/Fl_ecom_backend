import { logQueue } from "../queues/log-queue.js";

async function sendMessage() {
  const job = await logQueue.add("log-message", {
    message: "Hello world from producer app !",
    sentAt: new Date().toISOString(),
  });

  console.log("Job sent with id", job.id);
  process.exit(0);
}

sendMessage(); 