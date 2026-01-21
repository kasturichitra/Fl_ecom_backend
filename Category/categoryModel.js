import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";
import { imageSchema } from "../lib/imageModel.js";

// -------------------- ATTRIBUTE SCHEMA --------------------
const attributesSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    units: { type: String, trim: true },
    code: { type: String, trim: true },
    // slug: { type: String, trim: true },
    // description: { type: String, trim: true },
    // is_active: { type: Boolean, default: true },
    // created_by: { type: String, trim: true },
    // updated_by: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for attributes
attributesSchema.index({ code: 1 });
// attributesSchema.index({ slug: 1 });

// -------------------- CATEGORY SCHEMA --------------------
const categorySchema = new mongoose.Schema(
  {
    industry_unique_id: {
      type: String,
      required: true,
    },
    category_unique_id: {
      type: String,
      required: true,
    },
    category_name: {
      type: String,
      required: true,
      trim: true,
    },
    category_image: {
      type: imageSchema,
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
      trim: true,
    },
    attributes: [attributesSchema],
  },
  { timestamps: true }
);

// -------------------- INDEXES FOR CATEGORY --------------------
// Common query indexes for best performance
categorySchema.index({ is_active: 1, industry_unique_id: 1 });
categorySchema.index({ category_unique_id: 1 }, { unique: false }); // unique false because you handle uniqueness manually
categorySchema.index({ category_name: 1 });
categorySchema.index({ created_by: 1 });

// Compound indexes (very useful)
categorySchema.index({ industry_unique_id: 1, category_unique_id: 1 });
categorySchema.index({ category_name: "text" }); // enables text search

// -------------------- EXPORT MODEL --------------------
export const CategoryModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Category || db.model("Category", categorySchema);
};



// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const attributesSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//     },
//     code: {
//       type: String,
//       trim: true,
//     },
//     slug: {
//       type: String,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     units: {
//       type: String,
//       trim: true,
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     created_by: {
//       type: String,
//       // required: true,
//       trim: true,
//     },
//     updated_by: {
//       type: String,
//       // required: true,
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const categorySchema = new mongoose.Schema(
//   {
//     // category_type_unique_id: {
//     //   type: String,
//     //   required: true,
//     // },
//     industry_unique_id: {
//       type: String,
//       required: true,
//       // unique: true,
//     },
//     category_unique_id: {
//       type: String,
//       required: true,
//     },
//     category_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     category_image: {
//       type: String,
//       // required: true,
//       default: null,
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     created_by: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     updated_by: {
//       type: String,
//       trim: true,
//     },
//     attributes: [attributesSchema],
//     // category_brand: {
//     //   type: String,
//     //   required: true,
//     //   trim: true,
//     // },

//     // category_discription: {
//     //     type: String,
//     //     required: true,
//     // }
//   },
//   {
//     timestamps: true,
//   }
// );

// export const CategoryModel = async (tenantID) => {
//   const db = await getTenanteDB(tenantID);
//   return db.models.Category || db.model("Category", categorySchema);
// };
