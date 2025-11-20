import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const industryTypeSchema = new mongoose.Schema(
  {
    industry_unique_id: {
      type: String,
      required: true,
      unique: true,
      index: true,          // 🔥 Faster lookup
    },
    industry_name: {
      type: String,
      required: true,
      trim: true,
      index: true,          // 🔥 Search optimization
    },
    image_url: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,          // 🔥 Active/inactive filters become fast
    },
    created_by: {
      type: String,
      trim: true,
    },
    updated_by: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,        // already handles createdAt & updatedAt
    versionKey: false,       // removes __v
    strict: true,            // avoids unwanted fields
  }
);

// 🔥 Add compound indexes for faster filters
industryTypeSchema.index({ industry_unique_id: 1, is_active: 1 });

// 🔥 Lightweight queries support
industryTypeSchema.set("toJSON", { virtuals: true });
industryTypeSchema.set("toObject", { virtuals: true });

// ----------------------------------
// MODEL CREATION (Optimized)
// ----------------------------------
const IndustryTypeModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);

  // 🔥 Prevents model recompilation in multi-tenant setup
  return db.models.IndustryType || db.model("IndustryType", industryTypeSchema);
};

export default IndustryTypeModel;



// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const industryTypeSchema = new mongoose.Schema(
//   {
//     industry_unique_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     industry_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // industry_code: {
//     //   type: String,
//     //   trim: true,
//     // },
//     image_url: {
//       type: String,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     created_by: {
//       type: String,
//       trim: true,
//     },
//     updated_by: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// const IndustryTypeModel = async (tenantID) => {
//   const db = await getTenanteDB(tenantID);
//   return db.models.IndustryType || db.model("IndustryType", industryTypeSchema);
// };

// export default IndustryTypeModel;
