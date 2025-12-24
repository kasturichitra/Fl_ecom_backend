import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const saleTrendProductSchema = new mongoose.Schema(
  {
    product_unique_id: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: Number,
      required: true,
    }
  },
  {
    _id: false,
  }
);

const saleTrendSchema = new mongoose.Schema(
  {
    trend_name: {
      type: String,
      required: true,
      trim: true,
    },
    trend_unique_id: {
      type: String,
      required: true,
      unique: true,
    },
    trend_products: [saleTrendProductSchema],
    trend_from: {
      type: Date,
      required: true,
    },
    trend_to: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

saleTrendProductSchema.index({ is_active: 1, product_unique_id: 1 });
saleTrendSchema.index({ trend_unique_id: 1 });
saleTrendProductSchema.index({ priority: 1 });
saleTrendProductSchema.index({ trend_from: 1, trend_to: 1 });


const SaleTrendModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.SaleTrends || db.model("SaleTrends", saleTrendSchema);
};

export default SaleTrendModel;
