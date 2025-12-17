import { generateExcelTemplate } from "../Products/config/generateExcelTemplate.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { toTitleCase } from "../utils/conversions.js";
import { extractExcel, transformCategoryRow, transformRow, validateRow } from "../utils/etl.js";
import generateUniqueId from "../utils/generateUniqueId.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { CategoryModel } from "./categoryModel.js";
import IndustryTypeModel from "../IndustryType/industryTypeModel.js";
import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";

//this function is to create category
export const createCategoryService = async (
  tenantId,
  industry_unique_id,
  category_unique_id,
  category_name,
  category_image,
  created_by,
  attributes = []
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  if (!industry_unique_id || !category_name || !category_image || !created_by)
    throwIfTrue(
      true,
      "All industry_unique_id,category_name,category_unique_id,category_image,created_by fields are required"
    );

  const CategoryDB = await CategoryModel(tenantId);

  const normalizedName = category_name.trim().toLowerCase();
  const existingCategory = await CategoryDB.exists({ category_name: { $regex: `^${normalizedName}$`, $options: "i" } });

  throwIfTrue(existingCategory, "Category with this Name already exists");

  category_name = toTitleCase(category_name);

  category_unique_id = await generateUniqueId(CategoryDB, "CAT", "category_unique_id");

  return await CategoryDB.create({
    industry_unique_id,
    category_unique_id,
    category_name,
    category_image,
    created_by,
    attributes,
  });
};

//this function is to search category with pagination
export const getAllCategoriesService = async (tenantId, filters, search, page = 1, limit = 10, sortParam) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const skip = (page - 1) * limit;
  const categoryModelDB = await CategoryModel(tenantId);
  const r = (v) => ({ $regex: v, $options: "i" });

  const query = {};

  if (filters.category_name) query.category_name = r(filters.category_name);
  if (filters.category_brand) query.category_brand = r(filters.category_brand);
  if (filters.category_unique_id) query.category_unique_id = r(filters.category_unique_id);
  if (filters.industry_unique_id) query.industry_unique_id = filters.industry_unique_id;
  if (filters.is_active === "true") query.is_active = true;
  if (filters.is_active === "false") query.is_active = false;

  if (search) {
    query.$or = [
      { category_name: r(search) },
      { category_brand: r(search) },
      { category_unique_id: r(search) },
      { industry_unique_id: r(search) },
      { "attributes.name": r(search) },
      { "attributes.code": r(search) },
      { "attributes.slug": r(search) },
      { "attributes.units": r(search) },
    ];
  }

  const sortObj = buildSortObject(sortParam);
  const [categoryData, totalCount] = await Promise.all([
    categoryModelDB.find(query).skip(skip).limit(+limit).sort(sortObj).lean(),
    categoryModelDB.countDocuments(query),
  ]);

  return { categoryData, totalCount };
};

export const getCategoriesByIndustryIdService = async (tenantId, industry_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "industry_unique_id is required");

  const CategoryDB = await CategoryModel(tenantId);
  return await CategoryDB.find({ industry_unique_id }).sort({ createdAt: -1 }).lean();
};

export const getCategoryByIdService = async (tenantId, targetId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!targetId, "category_unique_id is required");

  const CategoryDB = await CategoryModel(tenantId);

  return await CategoryDB.findOne({ category_unique_id: targetId }).lean();
};

// export const updateCategoryService = async (tenantId, category_unique_id, updates) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");
//   throwIfTrue(!category_unique_id, "category_unique_id is required");

//   const CategoryDB = await CategoryModel(tenantId);

//   const existing = await CategoryDB.findOne({ category_unique_id });
//   throwIfTrue(!existing, "Category not found");

//   const oldImagePath = existing.category_image;

//   if (updates.attributes) {
//     const attrs = typeof updates.attributes === "string" ? JSON.parse(updates.attributes) : updates.attributes;
//     existing.attributes = attrs.map(a => ({
//       ...a,
//       is_active: a.is_active ?? true,
//       created_by: a.created_by || existing.created_by,
//       updated_by: a.updated_by || existing.updated_by || existing.created_by
//     }));
//     delete updates.attributes;
//   }

//   Object.assign(existing, updates, { updatedAt: new Date() });
//   const updatedRecord = await existing.save();

//   return { updatedRecord, oldImagePath };
// };
//this function is to delete catogory
export const updateCategoryService = async (tenantId, category_unique_id, updates) => {
  throwIfTrue(!tenantId || !category_unique_id, "IDs required");

  const ProductModel = (await import("../Products/productModel.js")).default;

  const [Category, Product] = await Promise.all([CategoryModel(tenantId), ProductModel(tenantId)]);

  const cat = await Category.findOneAndUpdate(
    { category_unique_id },
    { $set: { ...updates, updatedAt: new Date() } },
    { new: true }
  );

  if (!cat) throw new Error("Category not found");

  // Auto inactive all products if category inactivated
  if ("is_active" in updates) {
    await Product.updateMany(
      { category_unique_id },
      { $set: { is_active: !!updates.is_active, updatedAt: new Date() } }
    );
  }

  return cat;
};

export const deleteCategoryService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const categoryModelDB = await CategoryModel(tenantId);

  const deletedCategory = await categoryModelDB.findOneAndDelete({
    category_unique_id,
  });

  throwIfTrue(!deletedCategory, "Category not found");
  return deletedCategory;
};

export const downloadCategoryExcelTemplateService = async (tenantId, industry_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "Industry Unique ID is required");

  const allHeaders = staticCategoryExcelHeaders;

  const workbook = generateExcelTemplate(allHeaders);
  const sheet = workbook.getWorksheet("Template");
  sheet.getRow(2).getCell(1).value = industry_unique_id;
  return workbook;
};

export const categoryBulkUploadService = async (tenantId, filePath, excelHeaders, created_by) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const extractedRows = await extractExcel(filePath, excelHeaders);
  const categoryDB = await CategoryModel(tenantId);

  const success = [];
  const errors = [];

  for (const { rowNumber, raw } of extractedRows) {
    // 1 VALIDATE ROW
    const rowErrors = validateRow(raw, excelHeaders);

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        errors: rowErrors,
      });
    } else {
      success.push(transformCategoryRow(raw, excelHeaders));
    }

    if (success.length) {
      for (let i = 0; i < success.length; i++) {
        console.log("Success [i]", success[i]);
        const existing = await categoryDB.findOne({ category_unique_id: success[i].category_unique_id });
        if (existing) {
          errors.push({
            row: rowNumber,
            errors: [{ field: "", message: "Category already exists" }],
          });
        }

        success[i].created_by = created_by;

        // await categoryDB.create(success[i]);
        await categoryDB.insertMany(success);
      }
    }
  }

  return {
    totalRows: success.length + errors.length,
    successCount: success.length,
    errorCount: errors.length,
    success,
    errors,
  };
};

export const getGroupedIndustriesAndCategoriesService = async (tenantId, filters) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { industryPageLimit = 5, categoryPageLimit = 5 } = filters;
  const IndustryTypeDB = await IndustryTypeModel(tenantId);
  const CategoryDB = await CategoryModel(tenantId); // Ensure model is registered

  const industries = await IndustryTypeDB.aggregate([
    {
      $match: { is_active: true },
    },
    {
      $sort: { createdAt: -1 }, // Or sort by industry_name
    },
    {
      $limit: parseInt(industryPageLimit),
    },
    {
      $lookup: {
        from: "categories", // Collection name for CategoryModel
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
      $project: {
        industry_name: 1,
        categories: 1,
        _id: 0,
      },
    },
  ]);

  return { industries };
};
