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
import BrandModel from "../Brands/brandModel.js";

export const createProductService = async (tenantId, productData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  // Parse the attributes which come as text field in form data into true JSON Data
  productData = parseFormData(productData, "product_attributes");

  const CategoryModelDB = await CategoryModel(tenantId);
  const BrandModelDB = await BrandModel(tenantId);
  const existingBrand = await BrandModelDB.findOne({
    brand_unique_id: productData.brand_unique_id,
  });
  throwIfTrue(
    !existingBrand,
    `Brand not found with id: ${productData.brand_unique_id}`
  );
  const existingCategory = await CategoryModelDB.findOne({
    category_unique_id: productData.category_unique_id,
  });
  throwIfTrue(
    !existingCategory,
    `Category not found with id: ${productData.category_unique_id}`
  );

  productData.industry_unique_id = existingCategory.industry_unique_id;

  const productModelDB = await ProductModel(tenantId);

  const existingProduct = await productModelDB.findOne({
    product_unique_id: productData.product_unique_id,
  });

  throwIfTrue(existingProduct, "Product with unique id already exists");

  const { isValid, message } = validateProductData(productData);
  throwIfTrue(!isValid, message);
  productData.brand_name = existingBrand.brand_name;
  productData.category_name = existingCategory.category_name;
  const newProduct = await productModelDB.create(productData);
  return newProduct;
};

//This function get the data based on product_unique_id
// Return all products when no search filters are applied
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
    sort, // Sort shall be like sort=createdAt:desc, price:asc
    searchTerm, // Search term
    page = 1,
    limit = 10,
  } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const skip = (page - 1) * limit;

  const query = {};

  // --- String fields with regex ---
  if (product_name)
    query.product_name = { $regex: product_name, $options: "i" };
  if (sku) query.sku = { $regex: sku, $options: "i" };
  if (model_number)
    query.model_number = { $regex: model_number, $options: "i" };

  // --- Exact match fields ---
  if (gender) query.gender = gender;
  if (product_type) query.product_type = product_type;
  if (product_color) query.product_color = product_color;
  if (product_size) query.product_size = product_size;
  if (category_unique_id) query.category_unique_id = category_unique_id;
  if (industry_unique_id) query.industry_unique_id = industry_unique_id;
  if (brand_unique_id) query.brand_unique_id = brand_unique_id;
  if (barcode) query.barcode = barcode;
  if (stock_availability) query.stock_availability = stock_availability;
  if (cash_on_delivery) query.cash_on_delivery = cash_on_delivery;

  // Dynamic search on multiple fields for search term
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
    ];
  }

  // --- Range filters ---
  if (minimum_age || maximum_age) {
    query.minimum_age = {};
    query.maximum_age = {};
    if (minimum_age) query.minimum_age.$gte = Number(minimum_age);
    if (maximum_age) query.maximum_age.$lte = Number(maximum_age);
  }

  if (min_price || max_price) {
    query.price = {};
    if (min_price) query.price.$gte = Number(min_price);
    if (max_price) query.price.$lte = Number(max_price);
  }

  const sortObj = buildSortObject(sort);

  const productModelDB = await ProductModel(tenantId);

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
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        brand_name: "$brand.brand_name",
      },
    },
    {
      $project: {
        brand: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
    { $sort: sortObj },
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

// Get product by products unique id
export const getProductByUniqueIdService = async (
  tenantId,
  product_unique_id
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const productModelDB = await ProductModel(tenantId);

  const response = await productModelDB.findOne({
    product_unique_id,
  });

  return response;
};

export const updateProductService = async (
  tenantId,
  product_unique_id,
  updateData
) => {
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

  const response = await productModelDB.findOneAndUpdate(
    { product_unique_id },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

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
export const downloadExcelTemplateService = async (
  tenantId,
  category_unique_id
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const CategoryModelDB = await CategoryModel(tenantId);

  const categoryData = await CategoryModelDB.findOne({ category_unique_id });
  throwIfTrue(
    !categoryData,
    `Category not found with id: ${category_unique_id}`
  );

  const categoryDbAttributes = categoryData.attributes.length
    ? categoryData.attributes
    : undefined;

  const dynamicHeaders = categoryDbAttributes.map((attr) => ({
    header: `attr_${attr.name} *`,
    key: `attr_${attr.name}`,
    width: 30,
  }));

  const response = generateExcelTemplate(
    [...staticExcelHeaders, ...dynamicHeaders],
    category_unique_id
  );
  return response;
};

export const createBulkProductsService = async (tenantId, filePath) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!filePath, "File Path is required");
  throwIfTrue(
    !filePath.endsWith(".xlsx"),
    "Invalid file format - Plz provide only xlsx file"
  );

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

    for (let i = 0; i < valid.length; i++) {
      // Mandatory check for category and brand before creating product
      // const existingBrand = await BrandModel(tenantId).findOne({ brand_unique_id: valid[i].brand_unique_id });
      // if (!existingBrand) invalid.push({ rowNumber: i + 1, errors: [{ field: "", message: "Brand not found" }] });

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

      const { isValid, message } = validateProductData(valid[i]);
      if (!isValid)
        invalid.push({ rowNumber: i + 1, errors: [{ field: "", message }] });

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
export const getProductsBySubUniqueIDService = async (
  tenantId,
  category_unique_id
) => {
  if (!tenantId) throw new Error("Tenent ID is required");
  const productModelDB = await ProductModel(tenantId);

  const response = await productModelDB.find({
    category_unique_id,
  });

  return response;
};
