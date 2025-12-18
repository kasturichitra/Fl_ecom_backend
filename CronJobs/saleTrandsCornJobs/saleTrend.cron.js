import SaleTrendModel from "../../SaleTrend/saleTrendModel.js";

export const deactivateExpiredSaleTrendsService = async (tenantId) => {
    try {
        const SaleTrend = await SaleTrendModel(tenantId);

        const currentDate = new Date();

        // Update many: is_active = false where trend_to < currentDate AND is_active is true
        const result = await SaleTrend.updateMany(
            {
                trend_to: { $lt: currentDate },
                is_active: true
            },
            {
                $set: { is_active: false }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ [Tenant: ${tenantId}] Deactivated ${result.modifiedCount} expired sale trends.`);
        }
    } catch (error) {
        console.error(`❌ [Tenant: ${tenantId}] Error deactivating expired sale trends:`, error);
        throw error;
    }
};
