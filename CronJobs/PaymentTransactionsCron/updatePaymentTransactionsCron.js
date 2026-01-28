import { mongoUri } from "../../env.js";
import { updatePaymentTransactions } from "../../lib/producers/updatePaymentTransactionsProducer.js";
import { getTenantModels } from "../../lib/tenantModelsCache.js";
import { getTenantDatabases } from "../CornUtils/getTenantDatabases.js";

async function updateTenantPaymentTransactions(tenantId) {
  console.log("Tenant id coming into updateTenantPaymentTransactions function", tenantId);
  const { paymentTransactionsModelDB } = await getTenantModels(tenantId);

  const todayDate = new Date();
  const dateThreeDaysAgo = new Date(todayDate.getTime() - 3 * 24 * 60 * 60 * 1000);

  const pendingTransactions = await paymentTransactionsModelDB
    .find({
      payment_status: "Pending",
      createdAt: { $gte: dateThreeDaysAgo },
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log("pendingTransactions", pendingTransactions);

  for (const transaction of pendingTransactions) {
    const transactionPayload = {
      tenant_id: tenantId,
      transaction_reference_id: transaction.transaction_reference_id,
    };

    updatePaymentTransactions(transactionPayload);
  }

  console.log(`✅ [Tenant: ${tenantId}] Updated ${pendingTransactions.length} payment transactions.`);
}

export const updatePaymentTransactionsCronService = async () => {
  try {
    const tenantDbs = await getTenantDatabases();

    // Extract base DB name from URI (e.g. "mydatabase")
    const baseDbName = mongoUri.split("?")[0].split("/").pop();

    for (const dbName of tenantDbs) {
      let tenantId = dbName.replace(/_DB$/, "");

      // Remove the base name prefix if present
      if (baseDbName && tenantId.startsWith(baseDbName)) {
        tenantId = tenantId.slice(baseDbName.length);
      }

      await updateTenantPaymentTransactions(tenantId);
    }
  } catch (error) {
    console.error(`❌ Error updating payment transactions:`, error);
    throw error;
  }
};
