import mongoose from "mongoose";
import { orderProductSchema } from "../orderModel.js";
import { getTenanteDB } from "../../Config/tenantDB.js";

const offlineOrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },

    // // Customer details for offline orders
    // customer_name: {
    //   type: String,
    //   trim: true,
    // },
    // mobile_number: {
    //   type: String,
    //   trim: true,
    // },

    customer_id: {
      type: String,
      required: true,
    },

    order_products: [
      {
        type: orderProductSchema,
        required: true,
      },
    ],

    // Additional discount percentage (applied on discounted price)
    additional_discount_percentage: {
      type: Number,
      default: 0,
    },
    // Additional discount amount (subtracted from discounted price)
    additional_discount_amount: {
      type: Number,
      default: 0,
    },
    additional_discount_type: {
      type: String,
      // enum: ["percentage", "amount"],
      // default: "percentage",
    },

    // offline_address: {
    //   type: String,
    //   trim: true,
    // },
    base_price: { type: Number, required: true, min: 0 },
    gross_price: { type: Number, required: true, min: 0 },
    tax_value: { type: Number, default: 0 },
    discount_price: { type: Number, default: 0 },
    total_amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

offlineOrderSchema.index({ order_id: 1 });

const OfflineOrderModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.OfflineOrders || db.model("OfflineOrders", offlineOrderSchema);
};

export default OfflineOrderModel;
