import fs from "fs";

import throwIfTrue from "../utils/throwIfTrue.js";
import BrandModel from "./brandModel.js";
import { validateBrandCreate } from "./validations/validateBrandCreate.js";
import { validateBrandUpdate } from "./validations/validateBrandUpdate.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { CategoryModel } from "../Category/categoryModel.js";
import { toTitleCase } from "../utils/conversions.js";
import generateUniqueId from "../utils/generateUniqueId.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
// import { getTenantDatabases } from "../CronJobs/CornUtils/getTenantDatabases.js";

// Create Brand
export const createBrandService = async (tenantID, brandData, fileBuffer) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const brandModelDB = await BrandModel(tenantID);

  const normalizedName = brandData.brand_name.trim().toLowerCase();

  const existingBrand = await brandModelDB.exists({ brand_name: { $regex: `^${normalizedName}$`, $options: "i" } });
  throwIfTrue(existingBrand, "Brand with this Name already exists");

  const brand_unique_id = await generateUniqueId(brandModelDB, "BRD", "brand_unique_id");

  brandData.brand_unique_id = brand_unique_id;
  // console.log("brandData", brandData);

  brandData.brand_name = toTitleCase(brandData.brand_name);

  let brand_image = null;

  if (fileBuffer) {
    brand_image = await uploadImageVariants({
      fileBuffer: fileBuffer,
      // mimeType: data.image_url.mimetype,
      basePath: `${tenantID}/Brand/${brand_unique_id}`,
    });
  }

  const brandDoc = {
    ...brandData,
    brand_image,
  };

  console.log("brandDoc", brandDoc);
  const { isValid, message } = validateBrandCreate(brandDoc);
  throwIfTrue(!isValid, message);

  const response = await brandModelDB.create(brandDoc);

  return response;
};

// Get All Brands
export const getAllBrandsService = async (tenantID, filters) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const {
    brand_name,
    searchTerm,
    brand_unique_id,
    is_active,
    categories,
    category_unique_id,
    page = 1,
    limit = 10,
    sort,
  } = filters;

  const skip = (page - 1) * limit;
  const { brandModelDB, categoryModelDB } = await getTenantModels(tenantID);

  // const [brandModelDB, categoryModelDB] = await Promise.all([BrandModel(tenantID), CategoryModel(tenantID)]);

  const match = {};

  // Direct match filters
  if (brand_name) match.brand_name = { $regex: brand_name, $options: "i" };
  if (brand_unique_id) match.brand_unique_id = brand_unique_id;

  if (is_active === "true") match.is_active = true;
  if (is_active === "false") match.is_active = false;

  // Search
  if (searchTerm) {
    match.$or = [
      { brand_name: { $regex: searchTerm, $options: "i" } },
      { brand_unique_id: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Categories
  if (categories) {
    match.categories = { $in: categories.split(",") };
  }

  if (category_unique_id) {
    const categoryDoc = await categoryModelDB.findOne({ category_unique_id }, { _id: 1 });

    if (!categoryDoc) {
      return {
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        data: [],
      };
    }

    match.categories = {
      ...(match.categories || {}),
      $in: [...(match.categories?.$in || []), categoryDoc._id],
    };
  }

  const sortObj = buildSortObject(sort);

  const [result] = await brandModelDB.aggregate([
    { $match: match },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const totalCount = result.totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: result.data,
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
export const updateBrandService = async (tenantID, id, updateBrandData, fileBuffer) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Brand ID is required");

  const brandModelDB = await BrandModel(tenantID);

  if (updateBrandData.brand_unique_id) {
    const existingBrand = await brandModelDB.findOne({
      brand_unique_id: updateBrandData.brand_unique_id,
    });
    throwIfTrue(existingBrand, `Brand already exists with unique ID ${updateBrandData.brand_unique_id}`);
  }

  const existingBrand = await brandModelDB.findOne({
    brand_unique_id: id,
  });
  throwIfTrue(!existingBrand, `Brand not found with id: ${id}`);

  let brand_image = null;

  if (fileBuffer) {
    brand_image = await uploadImageVariants({
      fileBuffer: fileBuffer,
      // mimeType: data.image_url.mimetype,
      basePath: `${tenantID}/Brand/${updateBrandData.brand_unique_id}`,
    });
  }

  if (existingBrand?.brand_image && typeof existingBrand.brand_image === "object") {
    // Delete existing image after uploading new image
    const urls = Object.values(existingBrand.brand_image).filter((u) => typeof u === "string");
    await Promise.all(urls.map(autoDeleteFromS3));
  }

  const brandDoc = {
    ...updateBrandData,
    brand_image,
  };

  const { isValid, message } = validateBrandUpdate(brandDoc);
  throwIfTrue(!isValid, message);

  const updated = await brandModelDB.findOneAndUpdate({ brand_unique_id: id }, brandDoc, {
    new: true,
    runValidators: true,
  });

  return updated;
};
