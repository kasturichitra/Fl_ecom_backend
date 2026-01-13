import { getTenantModels } from "../../lib/tenantModelsCache.js";

export const aggregateBusinessTaxService = async (tenantId) => {
  try {
    const { userModelDB, orderModelDB, businessModelDB } = await getTenantModels(tenantId);

    // Find all business users
    const businessUsers = await userModelDB.find({ account_type: "Business" }, "_id");

    if (businessUsers.length === 0) {
      console.log(`[Cron] No business users found for tenant: ${tenantId}`);
      return;
    }

    const currentYear = new Date().getFullYear();

    for (const user of businessUsers) {
      const userId = user._id.toString();

      // Find the active and verified business for this user
      const activeBusiness = await businessModelDB.findOne({
        user_id: userId,
        is_verified: true,
        is_active: true,
      });

      if (!activeBusiness) {
        // console.log(`[Cron] No active and verified business found for user: ${userId}`);
        continue;
      }

      // Aggregate tax_value from all delivered orders of this user
      const aggregationResult = await orderModelDB.aggregate([
        { $match: { user_id: userId, order_status: "Delivered" } },
        { $group: { _id: null, totalTax: { $sum: "$tax_value" } } },
      ]);

      const totalTaxPaid = aggregationResult.length > 0 ? aggregationResult[0].totalTax : 0;

      // Update the specific Business entry
      await businessModelDB.findOneAndUpdate(
        { business_unique_id: activeBusiness.business_unique_id },
        {
          $set: {
            total_tax_paid: totalTaxPaid,
            current_year: currentYear,
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(`[Cron] Error aggregating business tax for tenant ${tenantId}:`, error);
  }
};
