import { getTenantModels } from "../../lib/tenantModelsCache.js";

export const deletePendingOrdersCronService = async (tenantId) => {
  try {
    const { orderModelDB } = await getTenantModels(tenantId);

    console.log("Log 1")

    const pendingSince = new Date();
    pendingSince.setDate(pendingSince.getDate() - 7); // 7 days ago

    const result = await orderModelDB.deleteMany({
      payment_status: "Pending",
      createdAt: { $lte: pendingSince },
    });

    console.log("Log 3", result); 

    if (result.deletedCount > 0) {
      console.log(`✅ [Tenant: ${tenantId}] Deleted ${result.deletedCount} pending orders.`);
    }
  } catch (error) {
    console.error(`❌ [Tenant: ${tenantId}] Error deleting pending orders:`, error);
    throw error;
  }
};
