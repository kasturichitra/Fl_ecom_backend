import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { toArray, toTitleCase } from "../utils/conversions.js";
import { extractExcel, transformRow, validateRow } from "../utils/etl.js";
import { generateQrPdfBuffer } from "../utils/generateQrPdf.js";
import { mergeExistingWithIncomingLists } from "../utils/mergeExistingWithIncomingLists.js";
import parseFormData from "../utils/parseFormDataIntoJsonData.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { generateExcelTemplate } from "./config/generateExcelTemplate.js";
import { staticExcelHeaders } from "./config/staticExcelHeaders.js";
import generateProductUniqueId from "./utils/generateProductUniqueId.js";
import { validateProductData } from "./validations/validateProductCreate.js";
import { validateProductUpdateData } from "./validations/validateProductUpdate.js";

/**
 * Calculate all price-related fields for a product
 *
 * Logic:
 * 1. base_price is the original MRP (tax-inclusive)
 * 2. Apply discount_percentage to get discounted_price
 * 3. Use reverse GST to extract taxable_value and tax from discounted_price
 * 4. final_price = discounted_price (after discount, tax-inclusive)
 *
 * @param {Object} productData - Product data with base_price, discount_percentage, and GST rates
 * @returns {Object} productData with all calculated price fields
 */
const calculatePrices = (productData) => {
  // Step 1: Get base price (MRP - tax inclusive)
  const basePrice = Number(productData.base_price);

  // Step 2: Get GST rates
  const cgst = Number(productData.cgst) || 0;
  const sgst = Number(productData.sgst) || 0;
  const igst = Number(productData.igst) || 0;
  const taxPercentage = cgst + sgst + igst;

  // Step 3: Calculate discount amount on base price
  const discountPercentage = Number(productData.discount_percentage) || 0;
  const discountAmount = (basePrice * discountPercentage) / 100;
  productData.discount_price = Math.ceil(discountAmount);

  // Step 4: Calculate discounted price (after discount, still tax-inclusive)
  const discountedPrice = basePrice - discountAmount;
  productData.discounted_price = Math.ceil(discountedPrice);

  // Step 5: Use REVERSE GST to extract taxable value and tax from discounted price
  // discounted_price is tax-inclusive, so we extract the tax portion
  const taxableValue = discountedPrice / (1 + taxPercentage / 100);
  const taxValue = discountedPrice - taxableValue;

  productData.tax_value = Math.ceil(taxValue);

  // Step 6: Calculate gross price (base + tax on base, for reference)
  // This represents the price WITH tax but BEFORE any discount
  const grossPrice = basePrice; // Since base is already tax-inclusive
  productData.gross_price = Math.ceil(grossPrice);

  // Step 7: Final price is the discounted price (tax-inclusive)
  const finalPrice = Math.ceil(discountedPrice);
  productData.final_price = finalPrice;

  return productData;
};

export const createProductService = async (tenantId, productData, productImageBuffer, productImagesBuffers) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  // Parse product_attributes from form-data
  productData = parseFormData(productData, "product_attributes");
  // Normalize incoming is_active variants and coerce string values to boolean
  // if (!Object.prototype.hasOwnProperty.call(productData, "is_active")) {
  //   if (Object.prototype.hasOwnProperty.call(productData, "isActive")) {
  //     productData.is_active = productData.isActive;
  //   } else if (Object.prototype.hasOwnProperty.call(productData, "is_Active")) {
  //     productData.is_active = productData.is_Active;
  //   }
  // }
  // if (typeof productData.is_active === "string") {
  //   productData.is_active = productData.is_active === "true";
  // }
  // const [CategoryModelDB, BrandModelDB, productModelDB] = await Promise.all([
  //   CategoryModel(tenantId),
  //   BrandModel(tenantId),
  //   ProductModel(tenantId),
  // ]);
  const { brandModelDB, categoryModelDB, productModelDB } = await getTenantModels(tenantId);
  const [existingBrand, existingCategory] = await Promise.all([
    brandModelDB.findOne({ brand_unique_id: productData.brand_unique_id }).lean(),
    categoryModelDB.findOne({ category_unique_id: productData.category_unique_id }).lean(),
  ]);
  throwIfTrue(!existingBrand, `Brand not found with id: ${productData.brand_unique_id}`);
  throwIfTrue(!existingCategory, `Category not found with id: ${productData.category_unique_id}`);
  productData.industry_unique_id = existingCategory.industry_unique_id;
  productData.product_name = toTitleCase(productData.product_name);
  productData.brand_name = existingBrand.brand_name;
  productData.category_name = existingCategory.category_name;
  // -------------------------------
  // CASE-INSENSITIVE DUPLICATE CHECK
  // -------------------------------
  const ci = (v) => String(v || "").trim(); // sanitized string (no lowercase)
  const norm = (v) =>
    String(v || "")
      .trim()
      .toLowerCase(); // normalized
  const possibleDuplicate = await productModelDB
    .findOne({
      product_name: { $regex: new RegExp(`^${ci(productData.product_name)}$`, "i") },
      product_color: { $regex: new RegExp(`^${ci(productData.product_color)}$`, "i") },
      product_size: { $regex: new RegExp(`^${ci(productData.product_size)}$`, "i") },
      brand_name: { $regex: new RegExp(`^${ci(existingBrand.brand_name)}$`, "i") },
      gender: { $regex: new RegExp(`^${ci(productData.gender)}$`, "i") },
    })
    .lean();
  if (possibleDuplicate) {
    // Build normalized attribute maps
    const newAttrMap = {};
    (productData.product_attributes || []).forEach((attr) => {
      newAttrMap[norm(attr.attribute_code)] = norm(attr.value);
    });
    const oldAttrMap = {};
    (possibleDuplicate.product_attributes || []).forEach((attr) => {
      oldAttrMap[norm(attr.attribute_code)] = norm(attr.value);
    });
    let allMatch = true;
    const matchedAttributes = [];
    for (const key in newAttrMap) {
      if (newAttrMap[key] === oldAttrMap[key]) {
        matchedAttributes.push(key);
      } else {
        allMatch = false;
        break;
      }
    }
    if (allMatch && matchedAttributes.length > 0) {
      throw new Error(`Identical product already exists`);
    }
  }
  // -------------------------------
  // Price calculations & unique ID
  // -------------------------------
  productData = calculatePrices(productData);
  productData.product_unique_id = await generateProductUniqueId(
    productModelDB,
    brandModelDB,
    productData.brand_unique_id
  );

  // -------------------------------
  // S3 Image Upload
  // -------------------------------
  // Upload single product_image (hero image)
  if (productImageBuffer) {
    productData.product_image = await uploadImageVariants({
      fileBuffer: productImageBuffer,
      basePath: `${tenantId}/Products/${productData.product_unique_id}/main`,
    });
  }

  // Upload multiple product_images (gallery images)
  if (productImagesBuffers && productImagesBuffers.length > 0) {
    const uploadPromises = productImagesBuffers.map((buffer, index) =>
      uploadImageVariants({
        fileBuffer: buffer,
        basePath: `${tenantId}/Products/${productData.product_unique_id}/gallery-${index}`,
      })
    );
    productData.product_images = await Promise.all(uploadPromises);
  }

  console.log("Final product data to be created: ", productData);

  // Validation
  const { isValid, message } = validateProductData(productData);
  throwIfTrue(!isValid, message);

  // Create product
  return await productModelDB.create(productData);
};

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
    category_name,
    // industry_name,  
    brand_name,
    barcode,
    stock_availability,
    cash_on_delivery,
    minimum_age,
    maximum_age,
    min_price,
    max_price,
    trend,
    sort,
    searchTerm,
    page = 1,
    limit = 10,
    is_active,
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

  if (category_name) query.category_name = category_name;
  // if (industry_name) query.industry_name = industry_name;
  if (brand_name) query.brand_name = brand_name;

  // --- ACTIVE STATE FILTER ---
  if (is_active !== undefined) {
    if (is_active === "true") query.is_active = true;
    else if (is_active === "false") query.is_active = false;
    else if (typeof is_active === "boolean") query.is_active = is_active;
  }

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
      { brand_name: { $regex: searchTerm, $options: "i" } },
      { category_name: { $regex: searchTerm, $options: "i" } },
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

  // const productModelDB = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  // Fetch trend data if trend filter is active
  let trendProductsMap = null;
  if (trend) {
    // const saleTrendModelDb = await SaleTrendModel(tenantId);
    const { saleTrendModelDB } = await getTenantModels(tenantId);
    const saleTrendData = await saleTrendModelDB.findOne({ trend_unique_id: trend }).lean();

    if (saleTrendData) {
      query.product_unique_id = { $in: saleTrendData.trend_products.map((p) => p.product_unique_id) };

      // Create a map of product_unique_id to priority
      trendProductsMap = {};
      saleTrendData.trend_products.forEach((p) => {
        trendProductsMap[p.product_unique_id] = p.priority;
      });
    }
  }

  // Build aggregation pipeline dynamically
  const pipeline = [
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

    // --- Lookup reviews ---
    {
      $lookup: {
        from: "productsreviews",
        localField: "product_unique_id",
        foreignField: "product_unique_id",
        as: "reviews",
      },
    },

    // --- Add average rating field ---
    {
      $addFields: {
        average_rating: { $avg: "$reviews.rating" },
        total_reviews: { $size: "$reviews" },
      },
    },

    // Optionally remove heavy review array
    {
      $project: {
        reviews: 0,
      },
    },
  ];

  // If trend is active, inject priority field and sort by it
  if (trendProductsMap) {
    const priorityCases = Object.entries(trendProductsMap).map(([productId, priority]) => ({
      case: { $eq: ["$product_unique_id", productId] },
      then: priority,
    }));

    pipeline.push({
      $addFields: {
        trend_priority: {
          $switch: {
            branches: priorityCases,
            default: 9999, // Products not in trend go to end
          },
        },
      },
    });

    // Sort by trend_priority first, then by other sort criteria
    pipeline.push({ $sort: { trend_priority: 1, ...sortObj } });
  } else {
    // Normal sorting without trend priority
    pipeline.push({ $sort: sortObj });
  }

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Execute aggregation
  const result = await productModelDB.aggregate([
    ...pipeline.filter((stage) => !stage.$skip && !stage.$limit),

    {
      $facet: {
        data: [...pipeline.filter((stage) => stage.$skip || stage.$limit)],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const data = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data,
  };
};

// Get product by products unique id
export const getProductByUniqueIdService = async (tenantId, product_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  // const productModelDB = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  const product = await productModelDB.aggregate([
    { $match: { product_unique_id } },

    // Join reviews
    {
      $lookup: {
        from: "productsreviews",
        localField: "product_unique_id",
        foreignField: "product_unique_id",
        as: "reviews",
      },
    },

    // Add average rating
    {
      $addFields: {
        average_rating: { $avg: "$reviews.rating" },
        total_reviews: { $size: "$reviews" },
      },
    },

    // Remove review list if you don't want full review array here
    {
      $project: {
        reviews: 0,
      },
    },
  ]);

  return product[0] || null;
};

export const updateProductService = async (
  tenantId,
  product_unique_id,
  updateData,
  productImageBuffer,
  productImagesBuffers
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { isValid, message } = validateProductUpdateData(updateData);
  throwIfTrue(!isValid, message);

  // const productModelDB = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  const existingProduct = await productModelDB
    .findOne({
      product_unique_id,
    })
    .lean();

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

  // -------------------------------
  // S3 Image Upload & Cleanup
  // -------------------------------
  // Handle single product_image (hero image)
  if (productImageBuffer) {
    // Delete existing hero image from S3 (all variants)
    if (existingProduct.product_image) {
      const imageUrls = Object.values(existingProduct.product_image).filter((url) => typeof url === "string");
      await Promise.all(imageUrls.map(autoDeleteFromS3));
    }

    // Upload new hero image
    updateData.product_image = await uploadImageVariants({
      fileBuffer: productImageBuffer,
      basePath: `${tenantId}/Products/${product_unique_id}/main`,
    });
  }

  // Handle multiple product_images (gallery images)
  if (productImagesBuffers && productImagesBuffers.length > 0) {
    // Delete existing gallery images from S3 (all variants)
    if (existingProduct.product_images?.length > 0) {
      const deletePromises = existingProduct.product_images.flatMap((imageObj) =>
        Object.values(imageObj)
          .filter((url) => typeof url === "string")
          .map(autoDeleteFromS3)
      );
      await Promise.all(deletePromises);
    }

    // Upload new gallery images
    const uploadPromises = productImagesBuffers.map((buffer, index) =>
      uploadImageVariants({
        fileBuffer: buffer,
        basePath: `${tenantId}/Products/${product_unique_id}/gallery-${index}`,
      })
    );
    updateData.product_images = await Promise.all(uploadPromises);
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

  // const productModelDB = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  const existingProduct = await productModelDB
    .findOne({
      product_unique_id,
    })
    .lean();

  throwIfTrue(!existingProduct, "Product not found");

  // -------------------------------
  // S3 Image Cleanup
  // -------------------------------
  // Delete single product_image (hero image) from S3 (all 3 variants)
  if (existingProduct.product_image) {
    const imageUrls = Object.values(existingProduct.product_image).filter((url) => typeof url === "string");
    await Promise.all(imageUrls.map(autoDeleteFromS3));
  }

  // Delete multiple product_images (gallery images) from S3 (all 3 variants each)
  if (existingProduct.product_images?.length > 0) {
    const deletePromises = existingProduct.product_images.flatMap((imageObj) =>
      Object.values(imageObj)
        .filter((url) => typeof url === "string")
        .map(autoDeleteFromS3)
    );
    await Promise.all(deletePromises);
  }

  // Finally, remove the product document
  const response = await productModelDB.findOneAndDelete({
    product_unique_id,
  });

  return response;
};

// This is to download excel template
export const downloadExcelTemplateService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { categoryModelDB, brandModelDB } = await getTenantModels(tenantId);

  const categoryData = await categoryModelDB.findOne({ category_unique_id });
  throwIfTrue(!categoryData, `Category not found with id: ${category_unique_id}`);

  const categoryDbAttributes = categoryData.attributes.length ? categoryData.attributes : undefined;

  const dynamicHeaders = categoryDbAttributes.map((attr) => ({
    header: `attr_${attr.name} *`,
    key: `attr_${attr.name}`,
    width: 30,
  }));

  // const BrandModelDB = await BrandModel(tenantId);
  const brandsForCategory = await brandModelDB.find({ categories: { $in: categoryData?._id } });

  console.log("brandsForCategory", brandsForCategory);

  const brandExcelDropDownData = await brandsForCategory.map(
    (brand) => `${brand.brand_name} (${brand.brand_unique_id})`
  );
  console.log("brandExcelDropDownData", brandExcelDropDownData);

  const brandExcelDropDownListString = `"${brandExcelDropDownData.join(",")}"`;

  const response = generateExcelTemplate([...staticExcelHeaders, ...dynamicHeaders], brandExcelDropDownListString);
  return response;
};

// export const createBulkProductsService = async (tenantId, category_unique_id, filePath) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");
//   throwIfTrue(!filePath, "File Path is required");
//   throwIfTrue(!filePath.endsWith(".xlsx"), "Invalid file format - Plz provide only xlsx file");

//   const extracted = await extractExcel(filePath, staticExcelHeaders);

//   const valid = [];
//   const invalid = [];

//   for (const row of extracted) {
//     const errors = validateRow(row.raw, staticExcelHeaders);
//     if (errors.length) {
//       invalid.push({ rowNumber: row.rowNumber, errors, data: row.raw });
//     } else {
//       valid.push(transformRow(row.raw, staticExcelHeaders));
//     }
//   }

//   const CategoryModelDB = await CategoryModel(tenantId);

//   const existingCategory = await CategoryModelDB.findOne({ category_unique_id });
//   throwIfTrue(!existingCategory, `Category not found with id: ${category_unique_id}`);

//   if (valid.length) {
//     const ProductModelDB = await ProductModel(tenantId);
//     const BrandModelDB = await BrandModel(tenantId);

//     for (let i = 0; i < valid.length; i++) {
//       const existingBrand = await BrandModelDB.findOne({
//         brand_unique_id: valid[i].brand_unique_id,
//       });
//       if (!existingBrand) {
//         invalid.push({
//           rowNumber: i + 1,
//           errors: [
//             {
//               field: "",
//               message: `Brand not found with id: ${valid[i].brand_unique_id}`,
//             },
//           ],
//         });
//         continue;
//       }

//       // const existingProduct = await ProductModelDB.findOne({
//       //   product_unique_id: valid[i].product_unique_id,
//       // });
//       // if (existingProduct) {
//       //   invalid.push({
//       //     rowNumber: i + 1,
//       //     errors: [
//       //       {
//       //         field: "",
//       //         message: `Product already exists with id: ${valid[i].product_unique_id}`,
//       //       },
//       //     ],
//       //   });
//       //   continue;
//       // }

//       const product_unique_id = await generateProductUniqueId(ProductModelDB, existingBrand.brand_unique_id);
//       valid[i].product_unique_id = product_unique_id;

//       valid[i].industry_unique_id = existingCategory.industry_unique_id;
//       valid[i].category_unique_id = existingCategory.category_unique_id;
//       valid[i].brand_name = existingBrand.brand_name;
//       valid[i].category_name = existingCategory.category_name;

//       valid[i] = calculatePrices(valid[i]);

//       const { isValid, message } = validateProductData(valid[i]);
//       if (!isValid) {
//         invalid.push({ rowNumber: i + 1, errors: [{ field: "", message }] });
//         continue;
//       }

//       await ProductModelDB.create(valid[i]);
//     }
//   }

//   return {
//     totalRows: extracted.length,
//     success: extracted.length - invalid.length,
//     failed: invalid.length,
//     errors: invalid,
//   };
// };

// Get Product By Mongo Db Id
export const createBulkProductsService = async (tenantId, category_unique_id, filePath) => {
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
  const { categoryModelDB, brandModelDB, productModelDB } = await getTenantModels(tenantId);
  const existingCategory = await categoryModelDB.findOne({ category_unique_id });
  throwIfTrue(!existingCategory, `Category not found with id: ${category_unique_id}`);
  if (valid.length) {
    for (let i = 0; i < valid.length; i++) {
      const existingBrand = await brandModelDB.findOne({
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
      // -------------------------------
      // CASE-INSENSITIVE DUPLICATE CHECK
      // -------------------------------
      const productData = valid[i];
      const ci = (v) => String(v || "").trim(); // sanitized string (no lowercase)
      const norm = (v) =>
        String(v || "")
          .trim()
          .toLowerCase(); // normalized
      // Helper to build field condition that handles empty/null/undefined values
      const buildFieldCondition = (fieldValue) => {
        const trimmed = ci(fieldValue);
        if (!trimmed) {
          // Match empty string, null, undefined, or field not existing
          return { $in: [null, undefined, ""] };
        }
        return { $regex: new RegExp(`^${trimmed}$`, "i") };
      };
      const duplicateQuery = {
        product_name: { $regex: new RegExp(`^${ci(productData.product_name)}$`, "i") },
        brand_name: { $regex: new RegExp(`^${ci(existingBrand.brand_name)}$`, "i") },
      };
      // Add optional fields with proper empty value handling
      const productColorVal = ci(productData.product_color);
      if (productColorVal) {
        duplicateQuery.product_color = { $regex: new RegExp(`^${productColorVal}$`, "i") };
      } else {
        duplicateQuery.$or = duplicateQuery.$or || [];
        duplicateQuery.$and = [
          { $or: [{ product_color: { $in: [null, undefined, ""] } }, { product_color: { $exists: false } }] },
        ];
      }
      const productSizeVal = ci(productData.product_size);
      if (productSizeVal) {
        duplicateQuery.product_size = { $regex: new RegExp(`^${productSizeVal}$`, "i") };
      } else {
        duplicateQuery.$and = duplicateQuery.$and || [];
        duplicateQuery.$and.push({
          $or: [{ product_size: { $in: [null, undefined, ""] } }, { product_size: { $exists: false } }],
        });
      }
      const genderVal = ci(productData.gender);
      if (genderVal) {
        duplicateQuery.gender = { $regex: new RegExp(`^${genderVal}$`, "i") };
      } else {
        duplicateQuery.$and = duplicateQuery.$and || [];
        duplicateQuery.$and.push({ $or: [{ gender: { $in: [null, undefined, ""] } }, { gender: { $exists: false } }] });
      }
      const possibleDuplicate = await productModelDB.findOne(duplicateQuery).lean();
      if (possibleDuplicate) {
        // Build normalized attribute maps
        const newAttrMap = {};
        (productData.product_attributes || []).forEach((attr) => {
          newAttrMap[norm(attr.attribute_code)] = norm(attr.value);
        });
        const oldAttrMap = {};
        (possibleDuplicate.product_attributes || []).forEach((attr) => {
          oldAttrMap[norm(attr.attribute_code)] = norm(attr.value);
        });
        let allMatch = true;
        const matchedAttributes = [];
        for (const key in newAttrMap) {
          if (newAttrMap[key] === oldAttrMap[key]) {
            matchedAttributes.push(key);
          } else {
            allMatch = false;
            break;
          }
        }
        if (allMatch && matchedAttributes.length > 0) {
          invalid.push({
            rowNumber: i + 1,
            errors: [
              {
                field: "",
                message: `Identical product already exists`,
              },
            ],
          });
          continue;
        }
      }
      // -------------------------------
      const product_unique_id = await generateProductUniqueId(productModelDB, existingBrand.brand_unique_id);
      valid[i].product_unique_id = product_unique_id;
      valid[i].industry_unique_id = existingCategory.industry_unique_id;
      valid[i].category_unique_id = existingCategory.category_unique_id;
      valid[i].brand_name = existingBrand.brand_name;
      valid[i].category_name = existingCategory.category_name;
      valid[i] = calculatePrices(valid[i]);
      const { isValid, message } = validateProductData(valid[i]);
      if (!isValid) {
        invalid.push({ rowNumber: i + 1, errors: [{ field: "", message }] });
        continue;
      }
      await productModelDB.create(valid[i]);
    }
  }
  return {
    totalRows: extracted.length,
    success: extracted.length - invalid.length,
    failed: invalid.length,
    errors: invalid,
  };
};

export const getProductByIdService = async (tenantId, id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { productModelDB } = await getTenantModels(tenantId);
  const response = await productModelDB.findOne({ _id: id });

  return response;
};

//This function is get by products based on subCategory_unique_ID
export const getProductsBySubUniqueIDService = async (tenantId, category_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { productModelDB } = await getTenantModels(tenantId);

  const response = await productModelDB.find({
    category_unique_id,
  });

  return response;
};

export const generateProductQrPdfService = async (tenantId, data) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { product_unique_id, quantity = 1 } = data;

  const { productModelDB } = await getTenantModels(tenantId);
  const existingProduct = await productModelDB.findOne({
    product_unique_id: product_unique_id,
  });
  throwIfTrue(!existingProduct, `Product not found with given unique id ${data.product_unique_id}`);

  const pdfBuffer = await generateQrPdfBuffer({
    product_name: existingProduct.product_name,
    product_unique_id: existingProduct.product_unique_id,
    quantity,
    final_price: existingProduct.final_price,
    category_name: existingProduct.category_name,
    brand_name: existingProduct.brand_name,
    product_color: existingProduct.product_color,
  });

  return {
    pdfBuffer,
    fileName: `qr-${existingProduct.product_name}-${quantity}.pdf`,
  };
};
