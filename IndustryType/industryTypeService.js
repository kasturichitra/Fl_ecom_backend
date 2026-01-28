import path from "path";
import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { toTitleCase } from "../utils/conversions.js";
import generateUniqueId from "../utils/generateUniqueId.js";
import throwIfTrue from "../utils/throwIfTrue.js";

/* ---------------------------------------------
   CREATE INDUSTRY
----------------------------------------------*/

export const createIndustryTypeServices = async (tenantID, data, fileBuffer, user_id = "69259c7026c2856821c44ced") => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!data.industry_name || !data.industry_name.trim(), "Industry Name is required");
  // const IndustryModel = await IndustryTypeModel(tenantID);
  const { industryTypeModelDB } = await getTenantModels(tenantID);

  const normalizedName = data.industry_name.trim().toLowerCase();

  const existingIndustry = await industryTypeModelDB.exists({
    industry_name: { $regex: `^${normalizedName}$`, $options: "i" },
  });

  throwIfTrue(existingIndustry, "Industry Type with this Name already exists");

  const industry_unique_id = await generateUniqueId(industryTypeModelDB, "IND", "industry_unique_id");

  const industry_name = toTitleCase(data.industry_name);

  let image_url = null;

  if (fileBuffer) {
    image_url = await uploadImageVariants({
      fileBuffer: fileBuffer,
      // mimeType: data.image_url.mimetype,
      basePath: `${tenantID}/IndustryType/${industry_unique_id}`,
    });
  }

  return await industryTypeModelDB.create({
    ...data,
    industry_name,
    industry_unique_id,
    description: data.description?.trim() || "",
    is_active: data.is_active ?? true,
    // image_url: data.image_url ?? null,
    image_url,
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
  sortParam,
) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { industryTypeModelDB } = await getTenantModels(tenantID);
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
  const result = await industryTypeModelDB.aggregate([
    { $match: query },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: +limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const industryData = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

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

export const updateIndustrytypeServices = async (tenantID, industry_unique_id, updates, fileBuffer) => {
  if (!tenantID || !industry_unique_id) throw new Error("Tenant ID & Industry ID required");

  const { industryTypeModelDB } = await getTenantModels(tenantID);

  // Lazy-load CategoryModel ONLY when needed → breaks circular dependency
  const CategoryModel = (await import("../Category/categoryModel.js")).CategoryModel;
  const categoryModelInstance = await CategoryModel(tenantID);

  const existingIndustry = await industryTypeModelDB.findOne({ industry_unique_id }).lean();
  throwIfTrue(!existingIndustry, "Industry Type not found");

  let image_url = null;

  if (fileBuffer) {
    image_url = await uploadImageVariants({
      fileBuffer: fileBuffer,
      // mimeType: data.image_url.mimetype,
      basePath: `${tenantID}/IndustryType/${industry_unique_id}`,
    });
  }

  // Delete existing image after uploading new image
  if (existingIndustry.image_url && typeof existingIndustry.image_url === "object") {
    const urls = Object.values(existingIndustry.image_url).filter((u) => typeof u === "string");
    await Promise.all(urls.map(autoDeleteFromS3));
  }

  const updated = await industryTypeModelDB
    .findOneAndUpdate(
      { industry_unique_id },
      { $set: { ...updates, image_url, updatedAt: new Date() } },
      { new: true, fields: { image_url: 1, is_active: 1 } },
    )
    .lean();

  if (!updated) throw new Error("Industry Type not found");

  // Cascade is_active
  // Cascade is_active -> update categories and products (optimized)
  if (updates.hasOwnProperty("is_active")) {
    const isActiveFlag = !!updates.is_active;
    const ProductModel = (await import("../Products/productModel.js")).default;
    const productModelInstance = await ProductModel(tenantID);

    // Run both updates in parallel using updateMany for best performance
    await Promise.all([
      categoryModelInstance.updateMany(
        { industry_unique_id },
        { $set: { is_active: isActiveFlag, updatedAt: new Date() } },
      ),
      productModelInstance.updateMany(
        { industry_unique_id },
        { $set: { is_active: isActiveFlag, updatedAt: new Date() } },
      ),
    ]);
  }

  return updated;
};
/* ---------------------------------------------
   DELETE INDUSTRY
----------------------------------------------*/
export const deleteIndustryTypeServices = async (tenantID, industry_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Type Unique ID is required");

  const { industryTypeModelDB, categoryModelDB, productModelDB } = await getTenantModels(tenantID);

  // Find current status to toggle
  const industry = await industryTypeModelDB.findOne({ industry_unique_id }).select("is_active").lean();
  throwIfTrue(!industry, "Industry Type not found");

  const newActiveStatus = !industry.is_active;

  // Update Industry status
  const updatedIndustry = await industryTypeModelDB
    .findOneAndUpdate(
      { industry_unique_id },
      { $set: { is_active: newActiveStatus, updatedAt: new Date() } },
      { new: true },
    )
    .lean();

  // Cascade status to categories and products
  await Promise.all([
    categoryModelDB.updateMany({ industry_unique_id }, { $set: { is_active: newActiveStatus, updatedAt: new Date() } }),
    productModelDB.updateMany({ industry_unique_id }, { $set: { is_active: newActiveStatus, updatedAt: new Date() } }),
  ]);

  return updatedIndustry;
};
