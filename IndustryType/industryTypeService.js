import IndustryTypeModel from "./industryTypeModel.js";
import fs from "fs";
import path from "path";
import throwIfTrue from "../utils/throwIfTrue.js";

/* ---------------------------------------------
   CREATE INDUSTRY
----------------------------------------------*/
export const createIndustryTypeServices = async (tenantID, data) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  const { industry_unique_id } = data;

  const existing = await IndustryModel.findOne({ industry_unique_id }).lean();
  throwIfTrue(existing, "Industry Type with this ID already exists");

  return await IndustryModel.create({
    industry_unique_id,
    industry_name: data.industry_name,
    description: data.description || "",
    is_active: typeof data.is_active === "boolean" ? data.is_active : true,
    created_by: data.created_by || "System",
    updated_by: data.updated_by || null,
    image_url: data.image_url || null,
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
  limit = 10
) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  const skip = (page - 1) * limit;

  const regex = (val) => ({ $regex: val, $options: "i" });

  const filterSearch = {};

  if (industry_name) filterSearch.industry_name = regex(industry_name);
  if (industry_unique_id) filterSearch.industry_unique_id = regex(industry_unique_id);
  if (created_by) filterSearch.created_by = regex(created_by);
  if (is_active !== undefined) filterSearch.is_active = is_active === "true";

  // Date filter
  if (startDate || endDate) {
    filterSearch.createdAt = {};
    if (startDate) filterSearch.createdAt.$gte = new Date(startDate);
    if (endDate) filterSearch.createdAt.$lte = new Date(endDate);
  }

  // Global search improvement
  const globalSearch = search
    ? {
        $or: [
          { industry_name: regex(search) },
          { industry_unique_id: regex(search) },
          { description: regex(search) },
          { created_by: regex(search) },
        ],
      }
    : null;

  const finalQuery = globalSearch
    ? { $and: [globalSearch, filterSearch] }
    : filterSearch;

  const [industryData, totalCount] = await Promise.all([
    IndustryModel.find(finalQuery)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean(),

    IndustryModel.countDocuments(finalQuery),
  ]);

  return {
    industryData,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  };
};

/* ---------------------------------------------
   UPDATE INDUSTRY
----------------------------------------------*/
export const updateIndustrytypeServices = async (tenantID, industry_unique_id, updates) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Unique ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  const existing = await IndustryModel.findOne({ industry_unique_id }).lean();
  throwIfTrue(!existing, "Industry Type not found");

  // Delete old image if new one is uploaded
  if (updates.image_url && existing.image_url) {
    try {
      const oldPath = path.resolve(existing.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch (err) {
      console.error("Error deleting old image:", err.message);
    }
  }

  updates.updatedAt = new Date();

  return await IndustryModel.findOneAndUpdate(
    { industry_unique_id },
    { $set: updates },
    { new: true }
  ).lean();
};

/* ---------------------------------------------
   DELETE INDUSTRY
----------------------------------------------*/
export const deleteIndustryTypeServices = async (tenantID, industry_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Type Unique ID is required");

  const IndustryModel = await IndustryTypeModel(tenantID);

  const existing = await IndustryModel.findOne({ industry_unique_id }).lean();
  throwIfTrue(!existing, "Industry Type not found");

  // Delete image file
  if (existing.image_url) {
    try {
      const imgPath = path.resolve(existing.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    } catch (err) {
      console.error("Error deleting image:", err.message);
    }
  }

  return await IndustryModel.findOneAndDelete({ industry_unique_id }).lean();
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
