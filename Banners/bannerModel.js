import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const BannerSchema = new mongoose.Schema(
  {
    banner_title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    banner_subtitle: {
      type: String,
      trim: true,
    },
    banner_description: {
      type: String,
      trim: true,
    },
    banner_image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    banner_link: {
      type: String,
      trim: true,
    },
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
  { timestamps: true }
);

const BannerModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Banner || db.model("Banner", BannerSchema);
};

export default BannerModel;
