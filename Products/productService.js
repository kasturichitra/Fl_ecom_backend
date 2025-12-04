import fs from "fs";

import throwIfTrue from "../utils/throwIfTrue.js";
import ProductModel from "./productModel.js";
import { validateProductData } from "./validations/validateProductCreate.js";
import { validateProductUpdateData } from "./validations/validateProductUpdate.js";
import parseFormData from "../utils/parseFormDataIntoJsonData.js";
import { mergeExistingWithIncomingLists } from "../utils/mergeExistingWithIncomingLists.js";
import { CategoryModel } from "../Category/categoryModel.js";
import { generateExcelTemplate } from "./config/generateExcelTemplate.js";
import { staticExcelHeaders } from "./config/staticExcelHeaders.js";
import { extractExcel, transformRow, validateRow } from "../utils/etl.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { toArray, toTitleCase } from "../utils/conversions.js";
import BrandModel from "../Brands/brandModel.js";

const calculatePrices = (productData) => {
  // Step 1: Get base price
  const basePrice = Number(productData.base_price);

  // Step 2: Calculate tax on base price
  const cgst = Number(productData.cgst) || 0;
  const sgst = Number(productData.sgst) || 0;
  const igst = Number(productData.igst) || 0;
  const taxPercentage = cgst + sgst + igst;
  let taxValue = (basePrice * taxPercentage) / 100;
  productData.tax_value = taxValue;

  // Step 3: Calculate gross price = base + tax
  const grossPrice = basePrice + taxValue;
  productData.gross_price = grossPrice;

  // Step 4: Calculate discount on base price
  const discountPercentage = Number(productData.discount_percentage) || 0;
  const discountAmount = (basePrice * discountPercentage) / 100;
  productData.discount_price = Math.ceil(discountAmount);

  const discountedPrice = basePrice - discountAmount;
  productData.discounted_price = Math.ceil(discountedPrice);

  // Step 5: Calculate final price which is the price after discount * tax
  taxValue = (discountedPrice * taxPercentage) / 100;
  productData.tax_value = Math.ceil(taxValue);

  const finalPrice = Math.ceil(discountedPrice + taxValue);
  productData.final_price = finalPrice;

  return productData;
};

export const createProductService = async (tenantId, productData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  // Parse the attributes which come as text field in form data into true JSON Data
  productData = parseFormData(productData, "product_attributes");

  const CategoryModelDB = await CategoryModel(tenantId);
  const BrandModelDB = await BrandModel(tenantId);
  const existingBrand = await BrandModelDB.findOne({
    brand_unique_id: productData.brand_unique_id,
  });
  throwIfTrue(!existingBrand, `Brand not found with id: ${productData.brand_unique_id}`);
  const existingCategory = await CategoryModelDB.findOne({
    category_unique_id: productData.category_unique_id,
  });
  throwIfTrue(!existingCategory, `Category not found with id: ${productData.category_unique_id}`);

  productData.industry_unique_id = existingCategory.industry_unique_id;

  const productModelDB = await ProductModel(tenantId);

  const existingProduct = await productModelDB.findOne({
    product_unique_id: productData.product_unique_id,
  });

  throwIfTrue(existingProduct, "Product with unique id already exists");

  productData.product_name = toTitleCase(productData.product_name);
  productData.brand_name = existingBrand.brand_name;
  productData.category_name = existingCategory.category_name;

  productData = calculatePrices(productData);

  console.log("Product data before going to validation", productData);

  const { isValid, message } = validateProductData(productData);
  throwIfTrue(!isValid, message);

  const newProduct = await productModelDB.create(productData);
  return newProduct;
};

// MAIN SERVICE
export const getAllProductsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let {
    product_name,
    sku,
    model_number,
    gender,
    product_type,
    product_color,
    product_size,
    category_unique_id,
    industry_unique_id,
    brand_unique_id,
    barcode,
    stock_availability,
    cash_on_delivery,
    minimum_age,
    maximum_age,
    min_price,
    max_price,
    sort,
    searchTerm,
    page = 1,
    limit = 10,
  } = filters;

  const query = {};

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  // --- STRING REGEX FIELDS ---
  if (product_name) query.product_name = { $regex: product_name, $options: "i" };
  if (sku) query.sku = { $regex: sku, $options: "i" };
  if (model_number) query.model_number = { $regex: model_number, $options: "i" };

  // --- EXACT MATCH FIELDS ---
  if (gender) query.gender = gender;
  if (product_type) query.product_type = product_type;
  if (product_color) query.product_color = product_color;
  if (product_size) query.product_size = product_size;
  if (barcode) query.barcode = barcode;
  if (stock_availability) query.stock_availability = stock_availability;
  if (cash_on_delivery) query.cash_on_delivery = cash_on_delivery;

  // --- MULTIPLE FILTER SUPPORT ---
  const brandIds = toArray(brand_unique_id);
  if (brandIds) query.brand_unique_id = { $in: brandIds };

  const categoryIds = toArray(category_unique_id);
  if (categoryIds) query.category_unique_id = { $in: categoryIds };

  const industryIds = toArray(industry_unique_id);
  if (industryIds) query.industry_unique_id = { $in: industryIds };

  // --- MAIN SEARCH TERM ---
  if (searchTerm) {
    query.$or = [
      { product_name: { $regex: searchTerm, $options: "i" } },
      { product_size: { $regex: searchTerm, $options: "i" } },
      { product_description: { $regex: searchTerm, $options: "i" } },
      { product_slug: { $regex: searchTerm, $options: "i" } },
      { product_color: { $regex: searchTerm, $options: "i" } },
      { model_number: { $regex: searchTerm, $options: "i" } },
      { product_type: { $regex: searchTerm, $options: "i" } },
      { sku: { $regex: searchTerm, $options: "i" } },
      { barcode: { $regex: searchTerm, $options: "i" } },
      { tag: { $regex: searchTerm, $options: "i" } },
      { country_of_origin: { $regex: searchTerm, $options: "i" } },
      { brand_unique_id: { $regex: searchTerm, $options: "i" } },
      { category_unique_id: { $regex: searchTerm, $options: "i" } },
      { industry_unique_id: { $regex: searchTerm, $options: "i" } },
      {
        "product_attributes.attribute_code": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "product_attributes.value": {
          $regex: searchTerm,
          $options: "i",
        },
      },
    ];
  }

  // --- AGE RANGE ---
  if (minimum_age || maximum_age) {
    query.minimum_age = {};
    query.maximum_age = {};
    if (minimum_age) query.minimum_age.$gte = Number(minimum_age);
    if (maximum_age) query.maximum_age.$lte = Number(maximum_age);
  }

  // --- PRICE RANGE ---
  if (min_price || max_price) {
    query.final_price = {};
    if (min_price) query.final_price.$gte = Number(min_price);
    if (max_price) query.final_price.$lte = Number(max_price);
  }

  // Sorting
  const sortObj = buildSortObject(sort);

  const productModelDB = await ProductModel(tenantId);

  // MAIN AGGREGATION
  const data = await productModelDB.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "brands",
        localField: "brand_unique_id",
        foreignField: "brand_unique_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    { $addFields: { brand_name: "$brand.brand_name" } },
    { $project: { brand: 0 } },
    { $sort: sortObj },
    { $skip: skip },
    { $limit: limit },
  ]);

  const totalCount = await productModelDB.countDocuments(query);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data,
  };
};

// API for production with atlas search provided by Mongo db atlas for text search

// export const getAllProductsService = async (tenantId, filters = {}) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");

//   let {
//     product_name,
//     sku,
//     model_number,
//     gender,
//     product_type,
//     product_color,
//     product_size,
//     category_unique_id,
//     industry_unique_id,
//     brand_unique_id,
//     barcode,
//     stock_availability,
//     cash_on_delivery,
//     minimum_age,
//     maximum_age,
//     min_price,
//     max_price,
//     sort,
//     searchTerm,
//     page = 1,
//     limit = 10,
//   } = filters;

//   page = parseInt(page) || 1;
//   limit = parseInt(limit) || 10;

//   const skip = (page - 1) * limit;
//   const query = {};

//   // --------------------
//   // Normal exact & regex filters
//   // --------------------
//   if (product_name) query.product_name = { $regex: product_name, $options: "i" };
//   if (sku) query.sku = { $regex: sku, $options: "i" };
//   if (model_number) query.model_number = { $regex: model_number, $options: "i" };

//   if (gender) query.gender = gender;
//   if (product_type) query.product_type = product_type;
//   if (product_color) query.product_color = product_color;
//   if (product_size) query.product_size = product_size;
//   if (category_unique_id) query.category_unique_id = category_unique_id;
//   if (industry_unique_id) query.industry_unique_id = industry_unique_id;
//   if (brand_unique_id) query.brand_unique_id = brand_unique_id;
//   if (barcode) query.barcode = barcode;
//   if (stock_availability) query.stock_availability = stock_availability;
//   if (cash_on_delivery) query.cash_on_delivery = cash_on_delivery;

//   if (minimum_age || maximum_age) {
//     query.minimum_age = {};
//     query.maximum_age = {};
//     if (minimum_age) query.minimum_age.$gte = Number(minimum_age);
//     if (maximum_age) query.maximum_age.$lte = Number(maximum_age);
//   }

//   if (min_price || max_price) {
//     query.price = {};
//     if (min_price) query.price.$gte = Number(min_price);
//     if (max_price) query.price.$lte = Number(max_price);
//   }

//   const sortObj = buildSortObject(sort);
//   const productModelDB = await ProductModel(tenantId);

//   // --------------------
//   // Final Aggregation Pipeline
//   // --------------------
//   const pipeline = [];

//   // --------------------------------------
//   // 🔥 ATLAS SEARCH STAGE (Lucene Engine)
//   // --------------------------------------
//   if (searchTerm) {
//     pipeline.push({
//       $search: {
//         index: "default", // your index name
//         text: {
//           query: searchTerm,
//           path: [
//             "product_name",
//             "product_description",
//             "product_slug",
//             "brand_name",
//             "category_name",
//             "tag",
//             "product_attributes.attribute_code",
//             "product_attributes.value"
//           ],
//           fuzzy: { maxEdits: 2 }
//         }
//       }
//     });
//   }

//   // Match all normal filters
//   pipeline.push({ $match: query });

//   // Join with brand info
//   pipeline.push(
//     {
//       $lookup: {
//         from: "brands",
//         localField: "brand_unique_id",
//         foreignField: "brand_unique_id",
//         as: "brand"
//       }
//     },
//     {
//       $unwind: {
//         path: "$brand",
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $addFields: {
//         brand_name: "$brand.brand_name"
//       }
//     },
//     {
//       $project: {
//         brand: 0
//       }
//     }
//   );

//   // Sorting & Pagination
//   pipeline.push(
//     { $sort: sortObj },
//     { $skip: skip },
//     { $limit: limit }
//   );

//   // Execute final query
//   const data = await productModelDB.aggregate(pipeline);

//   // Count total documents matching filters (without pagination)
//   const totalCount = await productModelDB.countDocuments(query);

//   return {
//     totalCount,
//     page,
//     limit,
//     totalPages: Math.ceil(totalCount / limit),
//     data
//   };
// };

// Get product by products unique id
export const getProductByUniqueIdService = async (tenantId, product_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const productModelDB = await ProductModel(tenantId);

  const response = await productModelDB.findOne({
    product_unique_id,
  });

  return response;
};

export const updateProductService = async (tenantId, product_unique_id, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { isValid, message } = validateProductUpdateData(updateData);
  throwIfTrue(!isValid, message);

  const productModelDB = await ProductModel(tenantId);

  const existingProduct = await productModelDB.findOne({
    product_unique_id,
  });

  throwIfTrue(!existingProduct, "Product not found");

  // Parse the attributes which come as text field in form data into true JSON Data
  updateData = parseFormData(updateData, "product_attributes");

  // Merge the existing attributes with the incoming attributes
  if (Array.isArray(updateData.product_attributes)) {
    updateData.product_attributes = mergeExistingWithIncomingLists(
      existingProduct.product_attributes || [],
      updateData.product_attributes,
      "attribute_code",
      "value"
    );
  }

  if (updateData.product_image && existingProduct.product_image) {
    if (fs.existsSync(existingProduct.product_image)) {
      fs.unlinkSync(existingProduct.product_image);
    }
  }

  if (updateData.product_images && existingProduct.product_images?.length > 0) {
    existingProduct.product_images.forEach((imgPath) => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });
  }

  const response = await productModelDB.findOneAndUpdate({ product_unique_id }, updateData, {
    new: true,
    runValidators: true,
  });

  return response;
};

//This function will delete products based on products uniqe ID
export const deleteProductService = async (tenantId, product_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const productModelDB = await ProductModel(tenantId);

  const existingProduct = await productModelDB.findOne({
    product_unique_id,
  });

  throwIfTrue(!existingProduct, "Product not found");

  if (existingProduct.product_image) {
    if (fs.existsSync(existingProduct.product_image)) {
      fs.unlinkSync(existingProduct.product_image);
    }
  }

  if (existingProduct.product_images?.length > 0) {
    existingProduct.product_images.forEach((imgPath) => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });
  }

  // 🔹 Finally, remove the product document
  const response = await productModelDB.findOneAndDelete({
    product_unique_id,
  });

  return response;
};

// This is to download excel template
export const downloadExcelTemplateService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const CategoryModelDB = await CategoryModel(tenantId);

  const categoryData = await CategoryModelDB.findOne({ category_unique_id });
  throwIfTrue(!categoryData, `Category not found with id: ${category_unique_id}`);

  const categoryDbAttributes = categoryData.attributes.length ? categoryData.attributes : undefined;

  const dynamicHeaders = categoryDbAttributes.map((attr) => ({
    header: `attr_${attr.name} *`,
    key: `attr_${attr.name}`,
    width: 30,
  }));

  const response = generateExcelTemplate([...staticExcelHeaders, ...dynamicHeaders], category_unique_id);
  return response;
};

export const createBulkProductsService = async (tenantId, filePath) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!filePath, "File Path is required");
  throwIfTrue(!filePath.endsWith(".xlsx"), "Invalid file format - Plz provide only xlsx file");

  const extracted = await extractExcel(filePath, staticExcelHeaders);

  const valid = [];
  const invalid = [];

  for (const row of extracted) {
    const errors = validateRow(row.raw, staticExcelHeaders);
    if (errors.length) {
      invalid.push({ rowNumber: row.rowNumber, errors, data: row.raw });
    } else {
      valid.push(transformRow(row.raw, staticExcelHeaders));
    }
  }

  if (valid.length) {
    const ProductModelDB = await ProductModel(tenantId);
    const CategoryModelDB = await CategoryModel(tenantId);
    const BrandModelDB = await BrandModel(tenantId);

    for (let i = 0; i < valid.length; i++) {
      const existingCategory = await CategoryModelDB.findOne({
        category_unique_id: valid[i].category_unique_id,
      });
      if (!existingCategory) {
        invalid.push({
          rowNumber: i + 1,
          errors: [
            {
              field: "",
              message: `Category not found with id: ${valid[i].category_unique_id}`,
            },
          ],
        });
        continue;
      }

      const existingBrand = await BrandModelDB.findOne({
        brand_unique_id: valid[i].brand_unique_id,
      });
      if (!existingBrand) {
        invalid.push({
          rowNumber: i + 1,
          errors: [
            {
              field: "",
              message: `Brand not found with id: ${valid[i].brand_unique_id}`,
            },
          ],
        });
        continue;
      }

      const existingProduct = await ProductModelDB.findOne({
        product_unique_id: valid[i].product_unique_id,
      });
      if (existingProduct) {
        invalid.push({
          rowNumber: i + 1,
          errors: [
            {
              field: "",
              message: `Product already exists with id: ${valid[i].product_unique_id}`,
            },
          ],
        });
        continue;
      }

      valid[i].industry_unique_id = existingCategory.industry_unique_id;
      valid[i].brand_name = existingBrand.brand_name;
      valid[i].category_name = existingCategory.category_name;

      valid[i] = calculatePrices(valid[i]);

      const { isValid, message } = validateProductData(valid[i]);
      if (!isValid) invalid.push({ rowNumber: i + 1, errors: [{ field: "", message }] });

      await ProductModelDB.create(valid[i]);
    }
  }

  return {
    totalRows: extracted.length,
    success: extracted.length - invalid.length,
    failed: invalid.length,
    errors: invalid,
  };
};

// Get Product By Mongo Db Id
export const getProductByIdService = async (tenantId, id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const productModelDB = await ProductModel(tenantId);
  const response = await productModelDB.findOne({ _id: id });

  return response;
};

//This function is get by products based on subCategory_unique_ID
export const getProductsBySubUniqueIDService = async (tenantId, category_unique_id) => {
  if (!tenantId) throw new Error("Tenent ID is required");
  const productModelDB = await ProductModel(tenantId);

  const response = await productModelDB.find({
    category_unique_id,
  });

  return response;
};
