import CouponModel from "../../Coupons/couponModel.js";

export const checkAndExpireCouponsService = async (tenantId) => {
    try {
        const Coupon = await CouponModel(tenantId);
        const now = new Date();

        const result = await Coupon.updateMany(
            {
                status: "Active",
                coupon_end_date: { $lt: now }
            },
            {
                $set: { status: "Inactive" }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`[Tenant: ${tenantId}] Deactivated ${result.modifiedCount} expired coupons.`);
        }
    } catch (error) {
        console.error(`[Tenant: ${tenantId}] Error checking expired coupons:`, error);
    }
};
