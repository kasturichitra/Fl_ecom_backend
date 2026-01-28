import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { generateExcelTemplate } from "../Products/config/generateExcelTemplate.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { toTitleCase } from "../utils/conversions.js";
import { extractExcel, transformCategoryRow, validateRow } from "../utils/etl.js";
import generateUniqueId from "../utils/generateUniqueId.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";
import { validateCategoryCreate } from "./validations/validateCategoryCreate.js";
import { validateCategoryUpdate } from "./validations/validateCategoryUpdate.js";

/**
 * Create Category
 */
export const createCategoryService = async (tenantId, categoryData, fileBuffer) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { categoryModelDB } = await getTenantModels(tenantId);

  // Check unique name
  const normalizedName = categoryData.category_name.trim().toLowerCase();
  // console.log("get categoryData===>", categoryData);

  categoryData.attributes?.forEach((a) => (a.code = normalizedName.replace(/\s+/g, "_")));

  // const splitedName = normalizedName.split(" ").join("_");
  // const replacedName = normalizedName.replace(/\s+/g, "_");

  // categoryData.attributes = categoryData.attributes?.map((attr) => ({
  //   ...attr,
  //   code: replacedName,
  // }));

  const existingCategory = await categoryModelDB.exists({
    category_name: { $regex: `^${normalizedName}$`, $options: "i" },
  });
  throwIfTrue(existingCategory, "Category with this Name already exists");

  // Format data
  categoryData.category_name = toTitleCase(categoryData.category_name);
  categoryData.category_unique_id = await generateUniqueId(categoryModelDB, "CAT", "category_unique_id");

  // S3 Image Upload
  let category_image = null;
  if (fileBuffer) {
    category_image = await uploadImageVariants({
      fileBuffer,
      basePath: `${tenantId}/Category/${categoryData.category_unique_id}`,
    });
  }

  const categoryDoc = {
    ...categoryData,
    category_image,
  };

  // Validate
  const { isValid, message } = validateCategoryCreate(categoryDoc);
  throwIfTrue(!isValid, message);
  console.log("categoryDoc===>", categoryDoc);
  return await categoryModelDB.create(categoryDoc);
};

/**
 * Get All Categories
 */
export const getAllCategoriesService = async (tenantId, filters, search, page = 1, limit = 10, sortParam) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const skip = (page - 1) * limit;
  const { categoryModelDB } = await getTenantModels(tenantId);
  const r = (v) => ({ $regex: v, $options: "i" });

  const query = {};

  if (filters.category_name) query.category_name = r(filters.category_name);
  if (filters.category_unique_id) query.category_unique_id = r(filters.category_unique_id);
  if (filters.industry_unique_id) query.industry_unique_id = filters.industry_unique_id;
  if (filters.is_active === "true") query.is_active = true;
  if (filters.is_active === "false") query.is_active = false;

  if (search) {
    query.$or = [
      { category_name: r(search) },
      { category_unique_id: r(search) },
      { industry_unique_id: r(search) },
      { "attributes.name": r(search) },
      { "attributes.code": r(search) },
    ];
  }

  const sortObj = buildSortObject(sortParam);

  const result = await categoryModelDB.aggregate([
    { $match: query },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: +limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const categoryData = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return { categoryData, totalCount };
};

/**
 * Get Categories by Industry
 */
export const getCategoriesByIndustryIdService = async (tenantId, industry_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "industry_unique_id is required");

  const { categoryModelDB } = await getTenantModels(tenantId);
  return await categoryModelDB.find({ industry_unique_id }).sort({ createdAt: -1 }).lean();
};

/**
 * Get Category by ID (Unique ID)
 */
export const getCategoryByIdService = async (tenantId, targetId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!targetId, "category_unique_id is required");

  const { categoryModelDB } = await getTenantModels(tenantId);
  return await categoryModelDB.findOne({ category_unique_id: targetId }).lean();
};

/**
 * Update Category
 */
export const updateCategoryService = async (tenantId, category_unique_id, updates, fileBuffer) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const { categoryModelDB } = await getTenantModels(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  const existingCategory = await categoryModelDB.findOne({ category_unique_id }).lean();
  throwIfTrue(!existingCategory, "Category not found");

  let category_image = updates.category_image;
  const normalizedName = updates.category_name.trim().toLowerCase();

  updates.attributes?.forEach((a) => (a.code = normalizedName.replace(/\s+/g, "_")));

  // Handle Image Update
  if (fileBuffer) {
    // Delete existingCategory variants
    if (existingCategory.category_image && typeof existingCategory.category_image === "object") {
      const urls = Object.values(existingCategory.category_image).filter((u) => typeof u === "string");
      await Promise.all(urls.map(autoDeleteFromS3));
    }

    // Upload new variants
    category_image = await uploadImageVariants({
      fileBuffer,
      basePath: `${tenantId}/Category/${category_unique_id}`,
    });
  }

  const categoryDoc = {
    ...updates,
    category_image,
  };

  // Validate
  const { isValid, message } = validateCategoryUpdate(categoryDoc);
  throwIfTrue(!isValid, message);

  const updatedRecord = await categoryModelDB.findOneAndUpdate(
    { category_unique_id },
    { $set: { ...categoryDoc, updatedAt: new Date() } },
    { new: true },
  );

  // Auto inactive all products if category inactivated
  if ("is_active" in updates) {
    console.log("Updating products is_active to ", !!updates.is_active);
    await productModelDB.updateMany(
      { category_unique_id },
      { $set: { is_active: !!updates.is_active, updatedAt: new Date() } },
    );
  }

  return updatedRecord;
};

/**
 * Delete Category
 */
export const deleteCategoryService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const { categoryModelDB, productModelDB } = await getTenantModels(tenantId);

  // Find current status to toggle
  const category = await categoryModelDB.findOne({ category_unique_id }).select("is_active").lean();
  throwIfTrue(!category, "Category not found");

  const newActiveStatus = !category.is_active;

  // Update Category status
  const updatedCategory = await categoryModelDB
    .findOneAndUpdate(
      { category_unique_id },
      { $set: { is_active: newActiveStatus, updatedAt: new Date() } },
      { new: true },
    )
    .lean();

  // Cascade status to products
  await productModelDB.updateMany(
    { category_unique_id },
    { $set: { is_active: newActiveStatus, updatedAt: new Date() } },
  );

  return updatedCategory;
};

/**
 * Download Template
 */
export const downloadCategoryExcelTemplateService = async (tenantId, industry_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Unique ID is required");

  const workbook = generateExcelTemplate(staticCategoryExcelHeaders);
  const sheet = workbook.getWorksheet("Template");
  sheet.getRow(2).getCell(1).value = industry_unique_id;
  return workbook;
};

/**
 * Bulk Upload
 */
export const categoryBulkUploadService = async (tenantId, filePath, excelHeaders, created_by) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const extractedRows = await extractExcel(filePath, excelHeaders);
  const { categoryModelDB } = await getTenantModels(tenantId);

  const success = [];
  const errors = [];

  for (const { rowNumber, raw } of extractedRows) {
    const rowErrors = validateRow(raw, excelHeaders);

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, errors: rowErrors });
    } else {
      const transformed = transformCategoryRow(raw, excelHeaders);
      transformed.created_by = created_by;

      const exists = await categoryModelDB.findOne({ category_unique_id: transformed.category_unique_id });
      if (exists) {
        errors.push({ row: rowNumber, errors: [{ field: "category_unique_id", message: "Category already exists" }] });
      } else {
        success.push(transformed);
      }
    }
  }

  if (success.length > 0) {
    await categoryModelDB.insertMany(success);
  }

  return {
    totalRows: extractedRows.length,
    successCount: success.length,
    errorCount: errors.length,
    success,
    errors,
  };
};

/**
 * Grouped industries and categories
 */
export const getGroupedIndustriesAndCategoriesService = async (tenantId, filters) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { industryPageLimit = 6, categoryPageLimit = 6 } = filters;
  const { industryTypeModelDB } = await getTenantModels(tenantId);

  const industries = await industryTypeModelDB.aggregate([
    { $match: { is_active: true } },
    { $sort: { createdAt: -1 } },
    { $limit: parseInt(industryPageLimit) },
    {
      $lookup: {
        from: "categories",
        localField: "industry_unique_id",
        foreignField: "industry_unique_id",
        pipeline: [
          { $match: { is_active: true } },
          { $project: { category_name: 1, category_unique_id: 1, _id: 0 } },
          { $limit: parseInt(categoryPageLimit) },
        ],
        as: "categories",
      },
    },
    {
      $project: { industry_name: 1, categories: 1, _id: 0 },
    },
  ]);

  return { industries };
};
