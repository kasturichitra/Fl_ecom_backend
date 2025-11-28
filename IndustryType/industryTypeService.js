import IndustryTypeModel from "./industryTypeModel.js";
import fs from "fs";
import path from "path";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import UserModel from "../Users/userModel.js";
import { title } from "process";

/* ---------------------------------------------
   CREATE INDUSTRY
----------------------------------------------*/

export const createIndustryTypeServices = async (tenantID, data, user_id="69259c7026c2856821c44ced") => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!data.industry_name || !data.industry_name.trim(), "Industry Name is required");
  const IndustryModel = await IndustryTypeModel(tenantID);

  if (data.industry_unique_id) {
    if (await IndustryModel.exists({ industry_unique_id: data.industry_unique_id }))
      throw new Error("Industry Type with this ID already exists");
  }
  
  return await IndustryModel.create({
    ...data,
    industry_name: data.industry_name.trim(),
    description: data.description?.trim() || "",
    is_active: data.is_active ?? true,
    image_url: data.image_url ?? null,
  });
};
/* ---------------------------------------------
   SEARCH INDUSTRIES (OPTIMIZED)
----------------------------------------------*/

export const getIndustrysSearchServices = async (
  tenantID,
  search = "",
  industry_name,
  industry_unique_id,
  is_active,
  created_by,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  sortParam
) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);
  const skip = (page - 1) * limit;
  const r = (v) => ({ $regex: v?.trim() || "", $options: "i" });

  const filter = {};
  if (industry_name) filter.industry_name = r(industry_name);
  if (industry_unique_id) filter.industry_unique_id = r(industry_unique_id);
  if (created_by) filter.created_by = r(created_by);
  if (is_active === "true") filter.is_active = true;
  if (is_active === "false") filter.is_active = false;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const query = search
    ? {
        $and: [
          {
            $or: [
              { industry_name: r(search) },
              { industry_unique_id: r(search) },
              { description: r(search) },
              { created_by: r(search) },
            ],
          },
          filter,
        ],
      }
    : filter;
  const sortObj = buildSortObject(sortParam);
  const [industryData, totalCount] = await Promise.all([
    IndustryModel.find(query).skip(skip).limit(+limit).sort(sortObj).lean(),
    IndustryModel.countDocuments(query),
  ]);

  return {
    industryData,
    totalCount,
    currentPage: +page,
    totalPages: Math.ceil(totalCount / limit),
  };
};
/* ---------------------------------------------
   UPDATE INDUSTRY
----------------------------------------------*/

export const updateIndustrytypeServices = async (tenantID, industry_unique_id, updates) => {
  if (!tenantID || !industry_unique_id) throw new Error("Tenant ID & Industry ID required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  // Lazy-load CategoryModel ONLY when needed → breaks circular dependency
  const CategoryModel = (await import("../Category/categoryModel.js")).CategoryModel;
  const categoryModelInstance = await CategoryModel(tenantID);

  const updated = await IndustryModel.findOneAndUpdate(
    { industry_unique_id },
    { $set: { ...updates, updatedAt: new Date() } },
    { new: true, fields: { image_url: 1, is_active: 1 } }
  ).lean();

  if (!updated) throw new Error("Industry Type not found");

  // Cascade is_active
  if (updates.hasOwnProperty("is_active")) {
    await categoryModelInstance.updateMany(
      { industry_unique_id },
      { $set: { is_active: !!updates.is_active, updatedAt: new Date() } }
    );
  }

  // Delete old image
  if (updates.image_url && updated.image_url && updated.image_url !== updates.image_url) {
    fs.unlink(path.resolve(updated.image_url), () => {});
  }

  return updated;
};
/* ---------------------------------------------
   DELETE INDUSTRY
----------------------------------------------*/
export const deleteIndustryTypeServices = async (tenantID, industry_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Type Unique ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  // One query: get image_url + delete atomically
  const doc = await IndustryModel.findOneAndDelete({ industry_unique_id }).select("image_url").lean();

  if (!doc) throw new Error("Industry Type not found");
  if (doc.image_url) fs.unlink(path.resolve(doc.image_url), () => {});

  return doc;
};

// import IndustryTypeModel from "./industryTypeModel.js";
// import fs from "fs";
// import path from "path";
// import throwIfTrue from "../utils/throwIfTrue.js";

// export const createIndustryTypeServices = async (tenantID, data) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");

//   const industryModelDB = await IndustryTypeModel(tenantID);

//   const existing = await industryModelDB.findOne({
//     industry_unique_id: data.industry_unique_id,
//   });
//   throwIfTrue(existing, "Industry Type with this ID already exists");

//   const newIndustry = await industryModelDB.create({
//     industry_unique_id: data.industry_unique_id,
//     industry_name: data.industry_name,
//     description: data.description || "",
//     is_active: typeof data.is_active === "boolean" ? data.is_active : true,
//     created_by: data.created_by || "System",
//     updated_by: data.updated_by || null,
//     image_url: data.image_url || null,
//   });

//   return newIndustry;
// };

// export const getIndustrysSearchServices = async (
//   tenantID,
//   search = "",
//   industry_name,
//   industry_unique_id,
//   is_active,
//   created_by,
//   startDate,
//   endDate,
//   page = 1,
//   limit = 10
// ) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");

//   const IndustryModel = await IndustryTypeModel(tenantID);

//   const skip = (page - 1) * limit;

//   const globalSearch = search
//     ? {
//         $or: [
//           { industry_name: { $regex: search, $options: "i" } },
//           { industry_unique_id: { $regex: search, $options: "i" } },
//           { description: { $regex: search, $options: "i" } },
//           { created_by: { $regex: search, $options: "i" } },
//         ],
//       }
//     : {};

//   const filterSearch = {};

//   if (industry_name) {
//     filterSearch.industry_name = { $regex: industry_name, $options: "i" };
//   }

//   if (industry_unique_id) {
//     filterSearch.industry_unique_id = {
//       $regex: industry_unique_id,
//       $options: "i",
//     };
//   }

//   if (is_active !== undefined) {
//     filterSearch.is_active = is_active === "true";
//   }

//   if (created_by) {
//     filterSearch.created_by = { $regex: created_by, $options: "i" };
//   }

//   if (startDate || endDate) {
//     filterSearch.createdAt = {};
//     if (startDate) filterSearch.createdAt.$gte = new Date(startDate);
//     if (endDate) filterSearch.createdAt.$lte = new Date(endDate);
//   }

//   const finalQuery = search ? { $and: [globalSearch, filterSearch] } : { ...filterSearch };

//   const industryData = await IndustryModel.find(finalQuery).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

//   const totalCount = await IndustryModel.countDocuments(finalQuery);

//   return {
//     industryData,
//     totalCount,
//     currentPage: page,
//     totalPages: Math.ceil(totalCount / limit),
//   };
// };

// export const updateIndustrytypeServices = async (tenantID, industry_unique_id, updates) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!industry_unique_id, "Industry Unique ID is required");

//   const industryModelDB = await IndustryTypeModel(tenantID);

//   const existingIndustry = await industryModelDB.findOne({ industry_unique_id });

//   throwIfTrue(!existingIndustry, "Industry Type not found");

//   if (updates.image_url && existingIndustry.image_url) {
//     const oldImagePath = path.resolve(existingIndustry.image_url);
//     if (fs.existsSync(oldImagePath)) {
//       try {
//         fs.unlinkSync(oldImagePath);
//       } catch (err) {
//         console.error("Error deleting old image:", err.message);
//       }
//     }
//   }

//   updates.updatedAt = new Date();

//   const updatedIndustry = await industryModelDB.findOneAndUpdate(
//     { industry_unique_id },
//     { $set: updates },
//     { new: true }
//   );

//   return updatedIndustry;
// };

// export const deleteIndustryTypeServices = async (tenantID, industry_unique_id) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!industry_unique_id, "Industry Type Unique ID is required");

//   const industryModelDB = await IndustryTypeModel(tenantID);

//   const existing = await industryModelDB.findOne({ industry_unique_id });

//   throwIfTrue(!existing, "Industry Type not found");

//   if (existing.image_url && fs.existsSync(existing.image_url)) {
//     try {
//       fs.unlinkSync(existing.image_url);
//     } catch (unlinkErr) {
//       console.error("Error deleting image:", unlinkErr.message);
//     }
//   }
//   const response = await industryModelDB.findOneAndDelete({ industry_unique_id });

//   return response;
// };
