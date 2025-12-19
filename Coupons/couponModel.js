import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const couponSchema = new mongoose.Schema({
    coupon_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    coupon_type: {
        type: String,
        required: true,
        enum: ["Generic", "User_Specific"]
    },
    discount_percentage: {
        type: Number,
        required: false
    },
    discount_amount: {
        type: Number,
        required: false
    },
    min_order_amount: {
        type: Number,
        required: false
    },
    max_discount_amount: {
        type: Number,
        required: false
    },
    apply_on: {
        type: String,
        required: true,
        enum: ["Product", "Category", "Brand", "Order"]
    },
    selected_products: {
        type: Array,
        default: []
    },
    selected_categories: {
        type: Array,
        default: []
    },
    selected_brands: {
        type: Array,
        default: []
    },
    total_useage_limit: {
        type: Number,
        default: 1
    },
    user_usage_limit: {
        type: Number,
        default: 1
    },
    coupon_start_date: {
        type: Date,
        required: true
    },
    coupon_end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
}, { timestamps: true });


const CouponModel = async (tenantId) => {
    const db = await getTenanteDB(tenantId);
    return db.models.Coupons || db.model("Coupons", couponSchema);
};

export default CouponModel;
