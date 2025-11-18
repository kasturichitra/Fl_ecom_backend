import throwIfTrue from "../utils/throwIfTrue.js";
import { CategoryModel } from "./categoryModel.js";

//this function is to create category
export const createCategoryService = async (
  tenantID,
  industry_unique_id,
  category_unique_id,
  category_name,
  // category_brand,
  category_image,
  created_by,
  // updated_by,
  attributes = []
) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  if (!industry_unique_id || !category_name || !category_unique_id || !category_image || !created_by) {
    throw new Error(
      "All industry_unique_id,category_name,category_unique_id,category_image,created_by fields are required"
    );
  }

  const CategoryModelDB = await CategoryModel(tenantID);

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
export const getAllCategoriesService = async (tenantID, filters, search, page = 1, limit = 10) => {
  // if (!tenantID) throw new Error("Tenant ID is required");
  throwIfTrue(!tenantID, "Tenant ID is required");

  const skip = (page - 1) * limit;

  const categoryModelDB = await CategoryModel(tenantID);

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

//this functon is to get category unique by ID
export const getCategoryByIdService = async (tenantID, targetId) => {
  throwIfTrue(!tenantID, "Tenate ID is required");
  throwIfTrue(!targetId, "Id is required to pass category ID");

  const categoryModelDB = await CategoryModel(tenantID);
  const getByIdData = await categoryModelDB.find({
    category_unique_id: targetId,
  });
  return getByIdData;
};

//this function is to update category
export const updateCategoryService = async (tenantID, category_unique_id, updates) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const Category = await CategoryModel(tenantID);

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
export const deleteCategoryService = async (tenantID, category_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!category_unique_id, "category_unique_id is required");

  const categoryModelDB = await CategoryModel(tenantID);

  const deletedCategory = await categoryModelDB.findOneAndDelete({
    category_unique_id: category_unique_id,
  });

  throwIfTrue(!deletedCategory, "Category not found");
  return deletedCategory;
};
