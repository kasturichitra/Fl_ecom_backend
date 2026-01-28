import { Worker } from "bullmq";
import { bullConnection } from "../bullmq/bullmqConnection.js";
import { getTenantModels } from "../tenantModelsCache.js";
import throwIfTrue from "../../utils/throwIfTrue.js";
import { getPaymentStatusService } from "../../Payment/paymentService.js";

/*
    Example JSON for job payload 
    {
        id: "Auto Generated Id", 
        data: {
            tenant_id: "tenant_id",
            transaction_reference_id: "TXN-1234",
        }
    }
*/
const updatePaymentTransactionsWorker = new Worker(
  "update-payment-transactions-queue",
  async (job) => {
    try {
      let { tenant_id, transaction_reference_id } = job?.data;

      const { paymentTransactionsModelDB } = await getTenantModels(tenant_id);

      const existingTransaction = await paymentTransactionsModelDB.findOne({
        transaction_reference_id,
      });
      throwIfTrue(!existingTransaction, "Invalid reference Id");

      const response = await getPaymentStatusService(tenant_id, transaction_reference_id);
      console.log("Response", response);
    } catch (error) {
      console.error("Error in update payment transactions worker", error);
      throw error;
    }
  },
  {
    concurrency: 10,
    connection: bullConnection,
  },
);

updatePaymentTransactionsWorker.on("completed", (job) => {
  console.log("Job completed with id", job.id);
});

updatePaymentTransactionsWorker.on("failed", (job) => {
  console.log("Job failed with id", job.id);
});

console.log("Update payment transactions worker started......");
