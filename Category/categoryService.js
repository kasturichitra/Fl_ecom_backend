import { generateExcelTemplate } from "../Products/config/generateExcelTemplate.js";
import { extractExcel, transformCategoryRow, transformRow, validateRow } from "../utils/etl.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { CategoryModel } from "./categoryModel.js";
import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";

//this function is to create category
export const createCategoryService = async (
  tenantId,
  industry_unique_id,
  category_unique_id,
  category_name,
  // category_brand,
  category_image,
  created_by,
  // updated_by,
  attributes = []
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  if (!industry_unique_id || !category_name || !category_unique_id || !category_image || !created_by) {
    throw new Error(
      "All industry_unique_id,category_name,category_unique_id,category_image,created_by fields are required"
    );
  }

  const CategoryModelDB = await CategoryModel(tenantId);

  const newCategory = await CategoryModelDB.create({
    industry_unique_id,
    category_unique_id,
    category_name,
    // category_brand,
    category_image,
    created_by,
    // updated_by,
    attributes,
  });

  return newCategory;
};

//this function is to search category with pagination
export const getAllCategoriesService = async (tenantId, filters, search, page = 1, limit = 10) => {
  // if (!tenantId) throw new Error("Tenant ID is required");
  throwIfTrue(!tenantId, "Tenant ID is required");

  const skip = (page - 1) * limit;

  const categoryModelDB = await CategoryModel(tenantId);

  const query = {};

  if (filters.category_name) {
    query.category_name = { $regex: filters.category_name, $options: "i" };
  }

  if (filters.category_brand) {
    query.category_brand = { $regex: filters.category_brand, $options: "i" };
  }

  if (filters.category_unique_id) {
    query.category_unique_id = { $regex: filters.category_unique_id, $options: "i" };
  }

  if (filters.is_active !== undefined) {
    query.is_active = filters.is_active === "true";
  }

  if (filters.industry_unique_id) {
    query.industry_unique_id = filters.industry_unique_id;
  }

  if (search) {
    query.$or = [
      { category_name: { $regex: search, $options: "i" } },
      { category_brand: { $regex: search, $options: "i" } },
      { category_unique_id: { $regex: search, $options: "i" } },
      { industry_unique_id: { $regex: search, $options: "i" } },

      { "attributes.name": { $regex: search, $options: "i" } },
      { "attributes.code": { $regex: search, $options: "i" } },
      { "attributes.slug": { $regex: search, $options: "i" } },
      { "attributes.units": { $regex: search, $options: "i" } },
    ];
  }

  const categoryData = await categoryModelDB.find(query).skip(Number(skip)).limit(Number(limit));

  const totalCount = await categoryModelDB.countDocuments(query);

  return { categoryData, totalCount };
};

export const getCategoriesByIndustryIdService = async (tenantId, industry_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!industry_unique_id, "industry_unique_id is required");

  const categoryModelDB = await CategoryModel(tenantId);
  const categoryData = await categoryModelDB.find({ industry_unique_id }).sort({ createdAt: -1 });
  return categoryData;
};

//this functon is to get category unique by ID
export const getCategoryByIdService = async (tenantId, targetId) => {
  throwIfTrue(!tenantId, "Tenate ID is required");
  throwIfTrue(!targetId, "Id is required to pass category ID");

  const categoryModelDB = await CategoryModel(tenantId);
  const getByIdData = await categoryModelDB.find({
    category_unique_id: targetId,
  });
  return getByIdData;
};

//this function is to update category
export const updateCategoryService = async (tenantId, category_unique_id, updates) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const Category = await CategoryModel(tenantId);

  const existing = await Category.findOne({ category_unique_id });

  throwIfTrue(!existing, "Category not found");

  const oldImagePath = existing.category_image;

  if (updates.attributes && Array.isArray(updates.attributes)) {
    existing.attributes = updates.attributes.map((attr) => ({
      name: attr.name,
      code: attr.code,
      slug: attr.slug,
      description: attr.description,
      units: attr.units,
      is_active: typeof attr.is_active === "boolean" ? attr.is_active : true,
      created_by: attr.created_by || existing.created_by,
      updated_by: attr.updated_by || existing.updated_by,
    }));
    delete updates.attributes;
  }

  Object.assign(existing, updates);
  existing.updatedAt = Date.now();

  const updatedRecord = await existing.save();

  return { updatedRecord, oldImagePath };
};

//this function is to delete catogory
export const deleteCategoryService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const categoryModelDB = await CategoryModel(tenantId);

  const deletedCategory = await categoryModelDB.findOneAndDelete({
    category_unique_id: category_unique_id,
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

        await categoryDB.create(success[i]);
      }
    }

    // console.log(transformed,'transformedtransformed');

    // try {
    //   //  SAVE INTO DB
    //   transformed.created_by = created_by;
    //   const saved = await categoryDB.create(transformed);

    //   success.push({
    //     row: rowNumber,
    //     data: saved,
    //   });
    // } catch (err) {
    //   errors.push({
    //     row: rowNumber,
    //     errors: [err.message],
    //   });
    // }
  }

  return {
    totalRows: success.length + errors.length,
    successCount: success.length,
    errorCount: errors.length,
    success,
    errors,
  };
};
