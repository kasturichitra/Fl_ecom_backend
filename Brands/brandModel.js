import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const brandSchema = new mongoose.Schema(
  {
    // Basic Info
    brand_name: {
      type: String,
      required: true,
      trim: true,
    },
    brand_unique_id: {
      type: String,
      required: true,
      unique: true,
    },
    brand_slug: {
      type: String,
      trim: true,
    },
    brand_description: {
      type: String,
      trim: true,
    },
    brand_image: {
      type: String,
    },
    brand_images: {
      type: [String],
    },

    // Relations
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // Status
    is_active: {
      type: Boolean,
      default: true,
    },

    // Created And Updated Info
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const BrandModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Brand || db.model("Brand", brandSchema);
};
export default BrandModel;
