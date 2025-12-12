import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const saleTrendProductSchema = new mongoose.Schema(
  {
    product_unique_id: {
      type: String,
      required: true,
      trim: true,
    },
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

const SaleTrendModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.SaleTrends || db.model("SaleTrends", saleTrendSchema);
};

export default SaleTrendModel;
