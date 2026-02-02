import { sendEmailQueue } from "../queues/sendEmailQueue.js";



export const sendEmailProducer= async (payload) => {
  // Simulate sending an email by logging the payload

  console.log("Sending email with payload in sendEmailProducer", payload);
  const job = await sendEmailQueue.add("send-email-queue", payload, {});
}