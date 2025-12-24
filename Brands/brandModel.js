import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";
import { imageSchema } from "../lib/imageModel.js";

const brandSchema = new mongoose.Schema(
  {
    // Basic Info
    brand_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      type: imageSchema,
    },
    // brand_images: {
    //   type: [imageSchema],
    // },
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
      index: true,
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
  }, 
);

brandSchema.index({ brand_name: 1, is_active: 1 });

const BrandModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Brand || db.model("Brand", brandSchema);
};
export default BrandModel;
