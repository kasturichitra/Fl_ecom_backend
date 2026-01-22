import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const bannerSchema = new mongoose.Schema(
  {
    banner_unique_id: {
      type: String,
      unique: true,
      required: [true, "Banner unique ID is required"],
    },
    section: {
      type: String,
      enum: ["course", "home", "recommended"],
      default: "home",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    banner_type: {
      type: String,
      enum: ["store", "item", "default"],
      default: "default",
    },
    store: {
      type: String,
    },
    item: {
      type: String,
    },
    link: {
      type: String,
    },
    banner_image: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Banner image is required"],
      },
    ],
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

const BannerModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Banner || db.model("Banner", bannerSchema);
};

export default BannerModel;
