import { Worker } from "bullmq";
import { sendEmailNotification } from "../../Tickets/utils/sendEmail.js";
import { bullConnection } from "../bullmq/bullmqConnection.js";

const sendEmailWorker = new Worker(
  "send-email-queue",
  async (job) => {
    try {
      console.log("Sending email with payload==>", job.data);
      await sendEmailNotification(job.data);
    } catch (error) {
      console.error("Error in send email worker", error);
      throw error;
    }
  },
  {
    concurrency: 5,
    connection: bullConnection,
  },
);

sendEmailWorker.on("completed", (job) => {
  console.log("Job completed with id", job.id);
});

sendEmailWorker.on("failed", (job) => {
  console.log("Job failed with id", job.id);
});
