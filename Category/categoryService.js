import throwIfTrue from "../utils/throwIfTrue.js";
import { CategoryModel } from "./categoryModel.js";



//this function is to create category
export const createCategoryServices = async (
  tenateID,
  industry_unique_ID,
  category_unique_Id,
  category_name,
  // category_brand,
  category_image,
  created_by,
  // updated_by,
  attributes = []
) => {
  throwIfTrue(!tenateID, "Tenant ID is required");
  if (!industry_unique_ID || !category_name || !category_unique_Id || !category_image || !created_by) {
    throw new Error("All industry_unique_ID,category_name,category_unique_Id,category_image,created_by fields are required");
  }

  const CategoryModelDB = await CategoryModel(tenateID);

  const newCategory = await CategoryModelDB.create({
    industry_unique_ID,
    category_unique_Id,
    category_name,
    // category_brand,
    category_image,
    created_by,
    // updated_by,
    attributes,
  });

  return newCategory;
};




//this function is to get all categories
export const getAllCategoriesSerices = async (tenateID) => {
  throwIfTrue(!tenateID, "Tenant ID is required");

  const categoryModelDB = await CategoryModel(tenateID)

  const categoriesdata = await categoryModelDB.find();
  return categoriesdata;

};



//this function is to search category with pagination

export const getAllCategorySearchServices = async (
  tenantID,
  filters,
  search,
  page = 1,
  limit = 10
) => {

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

  if (filters.category_unique_Id) {
    query.category_unique_Id = { $regex: filters.category_unique_Id, $options: "i" };
  }

  if (filters.is_active !== undefined) {
    query.is_active = filters.is_active === "true";
  }

  if (filters.industry_unique_ID) {
    query.industry_unique_ID = filters.industry_unique_ID;
  }



  if (search) {
    query.$or = [
      { category_name: { $regex: search, $options: "i" } },
      { category_brand: { $regex: search, $options: "i" } },
      { category_unique_Id: { $regex: search, $options: "i" } },
      { industry_unique_ID: { $regex: search, $options: "i" } },

      { "attributes.name": { $regex: search, $options: "i" } },
      { "attributes.code": { $regex: search, $options: "i" } },
      { "attributes.slug": { $regex: search, $options: "i" } },
      { "attributes.units": { $regex: search, $options: "i" } },
    ];
  }


  const categoryData = await categoryModelDB
    .find(query)
    .skip(Number(skip))
    .limit(Number(limit));

  const totalCount = await categoryModelDB.countDocuments(query);

  return { categoryData, totalCount };
};


//this functon is to get category unique by ID
export const getCategoryByIdServices = async (tenateID, targetId) => {

  throwIfTrue(!tenateID, "Tenate ID is required");
  throwIfTrue(!targetId, "Id is required to pass category ID");

  const categoryModelDB = await CategoryModel(tenateID)
  const getByIdData = await categoryModelDB.find({
    category_unique_Id: targetId
  });
  return getByIdData;

};



//this function is to update category
export const updateCategoryServices = async (
  tenantID,
  category_unique_Id,
  updates
) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!category_unique_Id, "category_unique_Id is required");

  const Category = await CategoryModel(tenantID);

  const existing = await Category.findOne({ category_unique_Id });

  throwIfTrue(!existing, "Category not found");

  const oldImagePath = existing.category_image;

  if (updates.attributes && Array.isArray(updates.attributes)) {
    existing.attributes = updates.attributes.map((attr) => ({
      name: attr.name,
      code: attr.code,
      slug: attr.slug,
      description: attr.description,
      units: attr.units,
      is_active:
        typeof attr.is_active === "boolean" ? attr.is_active : true,
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
export const deleteCategoryServices = async (tenantID, category_unique_Id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!category_unique_Id, "category_unique_Id is required");

  const categoryModelDB = await CategoryModel(tenantID);

  const deletedCategory = await categoryModelDB.findOneAndDelete({
    category_unique_Id: category_unique_Id,
  });

  throwIfTrue(!deletedCategory, "Category not found");
  return deletedCategory;

};
