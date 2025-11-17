import fs from "fs";

import throwIfTrue from "../utils/throwIfTrue.js";
import ProductsModel from "./productModels.js";
import { validateProductData } from "./validations/validateProductCreate.js";
import { validateProductUpdateData } from "./validations/validateProductUpdate.js";
import parseFormData from "../utils/parseFormDataIntoJsonData.js";
import { mergeExistingWithIncomingLists } from "../utils/mergeExistingWithIncomingLists.js";
import { CategoryModel } from "../Category/categoryModel.js";
import { generateExcelTemplate } from "./config/generateExcelTemplate.js";
import { staticExcelHeaders } from "./config/staticExcelHeaders.js";

export const createProductService = async (tenantID, productData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  // Parse the attributes which come as text field in form data into true JSON Data
  productData = parseFormData(productData, "product_attributes");

  const { isValid, message } = validateProductData(productData);
  throwIfTrue(!isValid, message);

  const productModelDB = await ProductsModel(tenantID);

  const existingProduct = await productModelDB.findOne({
    products_unique_ID: productData.products_unique_ID,
  });

  throwIfTrue(existingProduct, "Product with unique id already exists");

  const newProduct = await productModelDB.create(productData);
  return newProduct;
};

//This function get the data based on products_unique_ID
// Return all products when no search filters are applied
export const getAllProductsService = async (tenantID, filters = {}) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const {
    product_name,
    sku,
    model_number,
    gender,
    product_type,
    product_color,
    product_size,
    category_unique_Id,
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

  const skip = (page - 1) * limit;

  const query = {};

  // --- String fields with regex ---
  if (product_name) query.product_name = { $regex: product_name, $options: "i" };
  if (sku) query.sku = { $regex: sku, $options: "i" };
  if (model_number) query.model_number = { $regex: model_number, $options: "i" };

  // --- Exact match fields ---
  if (gender) query.gender = gender;
  if (product_type) query.product_type = product_type;
  if (product_color) query.product_color = product_color;
  if (product_size) query.product_size = product_size;
  if (category_unique_Id) query.category_unique_Id = category_unique_Id;
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

  // Sorting logic
  let sortObj = { createdAt: -1 }; // default
  if (sort) {
    sortObj = {};

    const sortFields = sort.split(",");
    // ["createdAt:desc", "price:asc"]

    for (const item of sortFields) {
      const [field, direction] = item.split(":");

      if (!field) continue;

      const order = direction === "asc" ? 1 : -1;

      sortObj[field] = order;
    }
  }

  const productModelDB = await ProductsModel(tenantID);

  const data = await productModelDB.find(query).skip(skip).limit(limit).sort(sortObj);

  const totalCount = await productModelDB.countDocuments(query);

  return {
    data,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

// Get product by products unique id
export const getProductByUniqueIdService = async (tenantID, productUniqueID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const productModelDB = await ProductsModel(tenantID);

  const response = await productModelDB.findOne({
    products_unique_ID: productUniqueID,
  });

  return response;
};

export const updateProductService = async (tenantID, productUniqueID, updateData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { isValid, message } = validateProductUpdateData(updateData);
  throwIfTrue(!isValid, message);

  const productModelDB = await ProductsModel(tenantID);

  const existingProduct = await productModelDB.findOne({
    products_unique_ID: productUniqueID,
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

  const response = await productModelDB.findOneAndUpdate({ products_unique_ID: productUniqueID }, updateData, {
    new: true,
    runValidators: true,
  });

  return response;
};

//This function will delete products based on products uniqe ID
export const deleteProductService = async (tenantID, productUniqueID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const productModelDB = await ProductsModel(tenantID);

  const existingProduct = await productModelDB.findOne({
    products_unique_ID: productUniqueID,
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
    products_unique_ID: productUniqueID,
  });

  return response;
};

// This is to download excel template
export const downloadExcelTemplateService = async (tenantID, category_unique_Id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const CategoryModelDB = await CategoryModel(tenantID);

  const categoryData = await CategoryModelDB.findOne({ category_unique_Id });
  throwIfTrue(!categoryData, `Category not found with id: ${category_unique_Id}`);

  const categoryDbAttributes = categoryData.attributes.length ? categoryData.attributes : undefined;

  const dynamicHeaders = categoryDbAttributes.map((attr) => ({
    header: `attr_${attr.code} : ${attr.name} *`,
    key: `attr_${attr.code} : ${attr.name}`,
    width: 30,
  }));

  const response = generateExcelTemplate([...staticExcelHeaders, ...dynamicHeaders]);
  return response;
};

// Get Product By Mongo Db Id
export const getProductByIdService = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const productModelDB = await ProductsModel(tenantID);
  const response = await productModelDB.findOne({ _id: id });

  return response;
};

//This function is get by products based on subCategory_unique_ID
export const getProductsBySubUniqueIDService = async (tenantID, category_unique_Id) => {
  if (!tenantID) throw new Error("Tenent ID is required");
  const productModelDB = await ProductsModel(tenantID);

  const response = await productModelDB.find({
    category_unique_Id: category_unique_Id,
  });

  return response;
};
