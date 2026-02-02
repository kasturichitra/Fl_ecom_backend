// producers/sendOtpProducer.js
// import { sendMobileSMSQueue } from "../queues/sendOtpQueue.js";

import { sendMobileSMSQueue } from "../queues/sendMobileSMSQueue.js";

export const sendMobileSMSJob = async ({ mobileNumber, message }) => {
  await sendMobileSMSQueue.add(
    "send-mobile-sms-queue",
    {
      mobileNumber,
      message,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 4000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};

// export default sendMobileSMSJob;