import fs from "fs";

import throwIfTrue from "../utils/throwIfTrue.js";
import BrandModel from "./brandModel.js";
import { validateBrandCreate } from "./validations/validateBrandCreate.js";
import { validateBrandUpdate } from "./validations/validateBrandUpdate.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { CategoryModel } from "../Category/categoryModel.js";
import { toTitleCase } from "../utils/conversions.js";
import generateUniqueId from "../utils/generateUniqueId.js";

// Create Brand
export const createBrandService = async (tenantID, brandData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { isValid, message } = validateBrandCreate(brandData);
  throwIfTrue(!isValid, message);

  const brandModelDB = await BrandModel(tenantID);

  const brand_unique_id = await generateUniqueId(brandModelDB, "BRD", "brand_unique_id");

  brandData.brand_unique_id = brand_unique_id;
  // console.log("brandData", brandData);

  brandData.brand_name = toTitleCase(brandData.brand_name);
  const response = await brandModelDB.create(brandData);
  return response;
};

// Get All Brands
export const getAllBrandsService = async (tenantID, filters) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const {
    brand_name,
    searchTerm, // Search term
    brand_unique_id,
    is_active,
    categories, // comma separated: "catId1,catId2"
    category_unique_id,
    page = 1,
    limit = 10,
    sort, // "brand_name:asc,createdAt:desc"
  } = filters;

  const skip = (page - 1) * limit;

  const brandModelDB = await BrandModel(tenantID);
  const categoryModelDB = await CategoryModel(tenantID);
  const query = {};

  // Direct match
  if (brand_name) query.brand_name = { $regex: brand_name, $options: "i" };
  if (brand_unique_id) query.brand_unique_id = brand_unique_id;
  // if (typeof is_active !== "undefined") query.is_active = is_active;

  if (is_active === "true") query.is_active = true;
  if (is_active === "false") query.is_active = false;

  // Search term
  if (searchTerm) {
    query.$or = [
      { brand_name: { $regex: searchTerm, $options: "i" } },
      { brand_unique_id: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Category filter
  if (categories) {
    const catIds = categories.split(",");
    query.categories = { $in: catIds };
  }

  if (category_unique_id) {
    const categoryDoc = await categoryModelDB.findOne({ category_unique_id });

    if (categoryDoc) {
      query.categories = {
        ...(query.categories || {}),
        $in: [...(query.categories?.$in || []), categoryDoc._id],
      };
    } else {
      // No category found; force empty result
      query.categories = { $in: [] };
    }
  }

  /// Sorting logic
  const sortObj = buildSortObject(sort);
  const brands = await brandModelDB.find(query).sort(sortObj).skip(skip).limit(Number(limit));

  const totalCount = await brandModelDB.countDocuments(query);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: brands,
  };
};

// Get Brand By Id
export const getBrandByIdService = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Brand ID is required");

  const brandModelDB = await BrandModel(tenantID);
  const response = await brandModelDB.findById(id);

  return response;
};

// Update Brand
export const updateBrandService = async (tenantID, id, updateBrandData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Brand ID is required");

  const { isValid, message } = validateBrandUpdate(updateBrandData);
  throwIfTrue(!isValid, message);

  const brandModelDB = await BrandModel(tenantID);

  if (updateBrandData.brand_unique_id) {
    const existingBrand = await brandModelDB.findOne({
      brand_unique_id: updateBrandData.brand_unique_id,
    });
    throwIfTrue(existingBrand, `Brand already exists with unique ID ${updateBrandData.brand_unique_id}`);
  }

  const existingBrand = await brandModelDB.findById(id);
  throwIfTrue(!existingBrand, `Brand not found with id: ${id}`);

  if (updateBrandData.brand_image && existingBrand.brand_image) {
    if (fs.existsSync(existingBrand.brand_image)) {
      fs.unlinkSync(existingBrand.brand_image);
    }
  }

  const updated = await brandModelDB.findByIdAndUpdate(id, updateBrandData, {
    new: true,
    runValidators: true,
  });

  return updated;
};
