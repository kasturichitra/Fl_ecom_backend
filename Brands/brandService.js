import throwIfTrue from "../utils/throwIfTrue.js";
import BrandModel from "./brandModel.js";
import { validateBrandCreate } from "./validations/validateBrandCreate.js";
import { validateBrandUpdate } from "./validations/validateBrandUpdate.js";

// Create Brand
export const createBrandService = async (tenantID, brandData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { isValid, message } = validateBrandCreate(brandData);
  throwIfTrue(!isValid, message);

  const brandModelDB = await BrandModel(tenantID);

  // Check if unique ID already exists
  const existingBrand = await brandModelDB.findOne({
    brand_unique_ID: brandData.brand_unique_ID,
  });
  throwIfTrue(existingBrand, `Brand already exists with unique ID ${brandData.brand_unique_ID}`);

  const response = await brandModelDB.create(brandData);
  return response;
};

// Get All Brands
export const getAllBrandsService = async (tenantID, filters) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const {
    brand_name,
    searchTerm, // Search term
    brand_unique_ID,
    is_active,
    categories, // comma separated: "catId1,catId2"
    page = 1,
    limit = 10,
    sort, // "brand_name:asc,createdAt:desc"
  } = filters;

  const skip = (page - 1) * limit;

  const brandModelDB = await BrandModel(tenantID);
  const query = {};

  // Direct match
  if (brand_name) query.brand_name = { $regex: brand_name, $options: "i" };
  if (brand_unique_ID) query.brand_unique_ID = brand_unique_ID;
  if (typeof is_active !== "undefined") query.is_active = is_active;

  // Search term
  if (searchTerm) {
    query.$or = [
      { brand_name: { $regex: searchTerm, $options: "i" } },
      { brand_unique_ID: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Category filter
  if (categories) {
    const catIds = categories.split(",");
    query.categories = { $in: catIds };
  }

  /// Sorting logic
  let sortObj = { createdAt: -1 }; // default
  if (sort) {
    sortObj = {};
    const sortFields = sort.split(",");

    for (const item of sortFields) {
      const [field, direction] = item.split(":");
      if (!field) continue;

      sortObj[field] = direction === "asc" ? 1 : -1;
    }
  }

  const brands = await brandModelDB.find(query).sort(sortObj).skip(skip).limit(Number(limit));

  const totalCount = await brandModelDB.countDocuments(query);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    brands,
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
export const updateBrandByIdService = async (tenantID, id, updateBrandData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Brand ID is required");

  const { isValid, message } = validateBrandUpdate(updateBrandData);
  throwIfTrue(!isValid, message);

  const brandModelDB = await BrandModel(tenantID);

  if (updateBrandData.brand_unique_ID) {
    const existingBrand = await brandModelDB.findOne({
      brand_unique_ID: updateBrandData.brand_unique_ID,
    });
    throwIfTrue(existingBrand, `Brand already exists with unique ID ${updateBrandData.brand_unique_ID}`);
  }

  const updated = await brandModelDB.findByIdAndUpdate(id, updateBrandData, {
    new: true,
    runValidators: true,
  });

  return updated;
};
