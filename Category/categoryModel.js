import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";



const attributesSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  units: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: String,
    // required: true,
    trim: true,
  },
  updated_by: {
    type: String,
    // required: true,
    trim: true,
  },
}, {
  timestamps: true,
})


const catogorySchema = new mongoose.Schema(
  {
    // category_type_unique_id: {
    //   type: String,
    //   required: true,
    // },
    industry_unique_ID: {
      type: String,
      required: true,
      // unique: true,
    },
    category_unique_Id: {
      type:String,
      required: true
    },
    category_name: {
      type: String,
      required: true,
      trim: true,
    },
    category_image: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
    },
    updated_by: {
      type: String,
      trim: true,
    },
    attributes: [attributesSchema]
    // category_brand: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    // category_discription: {
    //     type: String,
    //     required: true,
    // }
  },
  {
    timestamps: true,
  }

);


export const CategoryModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID)
  return db.models.Category || db.model("Category", catogorySchema);
}





