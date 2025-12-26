import { buildSortObject } from "../utils/buildSortObject.js";
import generateUniqueId from "../utils/generateUniqueId.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

// Helper to validate products exist
const validateProductsExist = async (tenantId, productIds) => {
  if (!productIds || productIds.length === 0) return;
  // const ProductModelDB = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);
  const foundProducts = await productModelDB
    .find({
      product_unique_id: { $in: productIds },
    })
    .select("product_unique_id");

  if (foundProducts.length !== productIds.length) {
    const foundIds = foundProducts.map((p) => p.product_unique_id);
    const missingIds = productIds.filter((id) => !foundIds.includes(id));
    throwIfTrue(true, `Products not found: ${missingIds.join(", ")}`);
  }
};

export const createSaleTrendService = async (tenantId, data) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!data.trend_name, "Trend name is required");
  throwIfTrue(!data.trend_from, "Trend start date is required");
  throwIfTrue(!data.trend_to, "Trend end date is required");

  // const SaleTrendDB = await SaleTrendModel(tenantId);
  const { saleTrendModelDB: SaleTrendDB } = await getTenantModels(tenantId);

  // Generate Unique ID
  const trend_unique_id = data.trend_name.replace(/\s+/g, "-").toLowerCase();

  const existingTrend = await SaleTrendDB.findOne({ trend_unique_id });
  throwIfTrue(existingTrend, "Trend name must be unique");

  // Generate Unique ID
  data.trend_unique_id = trend_unique_id;

  // Validate products if present
  if (data.trend_products && data.trend_products.length > 0) {
    const productIds = data.trend_products.map((p) => p.product_unique_id);
    await validateProductsExist(tenantId, productIds);
  }

  const newTrend = await SaleTrendDB.create(data);
  return newTrend;
};

export const getAllSaleTrendsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { page = 1, limit = 10, sort, searchTerm, products_limit = 10 } = filters;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  products_limit = parseInt(products_limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (searchTerm) {
    query.trend_name = { $regex: searchTerm, $options: "i" };
  }

  const sortObj = buildSortObject(sort);
  // const SaleTrendDB = await SaleTrendModel(tenantId);
  // const ProductModelDB = await ProductModel(tenantId);
  const { saleTrendModelDB: SaleTrendDB, productModelDB: ProductModelDB } = await getTenantModels(tenantId);

  /* -------------------------------------------------------------
     🔥 OPTIMIZED QUERY with $facet (Single DB Call)
  -------------------------------------------------------------- */
  const pipeline = [
    { $match: query },
    { $sort: Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          // --- LOOKUP PRODUCTS ONLY FOR PAGINATED RESULTS ---
          {
            $lookup: {
              from: ProductModelDB.collection.name,
              localField: "trend_products.product_unique_id",
              foreignField: "product_unique_id",
              as: "fetched_products",
            },
          },
          // --- MAP PRODUCTS ---
          {
            $addFields: {
              trend_products: {
                $map: {
                  input: products_limit ? { $slice: ["$trend_products", products_limit] } : "$trend_products",
                  as: "tp",
                  in: {
                    $mergeObjects: [
                      "$$tp",
                      {
                        $let: {
                          vars: {
                            matchedProduct: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$fetched_products",
                                    as: "fp",
                                    cond: {
                                      $eq: ["$$fp.product_unique_id", "$$tp.product_unique_id"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            product_name: "$$matchedProduct.product_name",
                            brand_name: "$$matchedProduct.brand_name",
                            final_price: "$$matchedProduct.final_price",
                            gross_price: "$$matchedProduct.gross_price",
                            product_image: "$$matchedProduct.product_image",
                            stock_quantity: "$$matchedProduct.stock_quantity",
                            discount_percentage: "$$matchedProduct.discount_percentage",
                            product_unique_id: "$$matchedProduct.product_unique_id",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          // --- CLEANUP ---
          {
            $project: {
              fetched_products: 0,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await SaleTrendDB.aggregate(pipeline);
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

export const getSaleTrendByUniqueIdService = async (tenantId, trend_unique_id, products_limit = 10) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  // const SaleTrendDB = await SaleTrendModel(tenantId);
  // const ProductModelDB = await ProductModel(tenantId);
  const { saleTrendModelDB: SaleTrendDB, productModelDB: ProductModelDB } = await getTenantModels(tenantId);
  products_limit = parseInt(products_limit) || 10;

  const pipeline = [
    {
      $match: {
        trend_unique_id: trend_unique_id,
      },
    },
    {
      $lookup: {
        from: ProductModelDB.collection.name,
        localField: "trend_products.product_unique_id",
        foreignField: "product_unique_id",
        as: "fetched_products",
      },
    },
    {
      $addFields: {
        trend_products: {
          $map: {
            input: products_limit ? { $slice: ["$trend_products", products_limit] } : "$trend_products",
            as: "tp",
            in: {
              $mergeObjects: [
                "$$tp",
                {
                  $let: {
                    vars: {
                      matchedProduct: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$fetched_products",
                              as: "fp",
                              cond: {
                                $eq: ["$$fp.product_unique_id", "$$tp.product_unique_id"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      product_name: "$$matchedProduct.product_name",
                      brand_name: "$$matchedProduct.brand_name",
                      final_price: "$$matchedProduct.final_price",
                      product_image: "$$matchedProduct.product_image",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        fetched_products: 0,
      },
    },
  ];

  const result = await SaleTrendDB.aggregate(pipeline);
  const trend = result[0];

  throwIfTrue(!trend, "Sale Trend not found");

  return trend;
};

export const updateSaleTrendService = async (tenantId, trend_unique_id, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  // const SaleTrendDB = await SaleTrendModel(tenantId);
  const { saleTrendModelDB: SaleTrendDB } = await getTenantModels(tenantId);

  // If updating products, validate them
  if (updateData.trend_products) {
    const productIds = updateData.trend_products.map((p) => p.product_unique_id);
    await validateProductsExist(tenantId, productIds);
  }

  const updatedTrend = await SaleTrendDB.findOneAndUpdate({ trend_unique_id }, updateData, {
    new: true,
    runValidators: true,
  });

  throwIfTrue(!updatedTrend, "Sale Trend not found");
  return updatedTrend;
};

export const deleteSaleTrendService = async (tenantId, trend_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!trend_unique_id, "Sale Trend ID is required");
  // const SaleTrendDB = await SaleTrendModel(tenantId);
  const { saleTrendModelDB: SaleTrendDB } = await getTenantModels(tenantId);

  const deletedTrend = await SaleTrendDB.findOneAndDelete({ trend_unique_id });
  throwIfTrue(!deletedTrend, "Sale Trend not found");

  return deletedTrend;
};

// // Add products to an existing trend
// export const addProductsToTrendService = async (tenantId, trendId, productIdsArray) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");
//   throwIfTrue(!Array.isArray(productIdsArray), "productIds must be an array");

//   // Validate products exist
//   await validateProductsExist(tenantId, productIdsArray);

//   const SaleTrendDB = await SaleTrendModel(tenantId);
//   const trend = await SaleTrendDB.findOne({ trend_unique_id: trendId });
//   throwIfTrue(!trend, "Sale Trend not found");

//   // Prepare objects to add
//   const productsToAdd = productIdsArray.map((id) => ({ product_unique_id: id }));

//   // Use $addToSet to avoid duplicates.
//   // However, $addToSet with objects only works if the objects are exactly identical.
//   // Since we only have { product_unique_id: "..." }, this works.
//   // If we had other fields, we'd need to be more careful.

//   // Actually, standard $addToSet might not check deeply if we had other fields, but schema only has product_unique_id wrapper.
//   // Let's iterate using bulk updates or just a simple loop if typically small, or one update.
//   // A single update with $addToSet per item in array is syntax:
//   // { $addToSet: { trend_products: { $each: productsToAdd } } }

//   const updatedTrend = await SaleTrendDB.findOneAndUpdate(
//     { trend_unique_id: trendId },
//     { $addToSet: { trend_products: { $each: productsToAdd } } },
//     { new: true }
//   );

//   return updatedTrend;
// };

// // Remove products from an existing trend
// export const removeProductsFromTrendService = async (tenantId, trendId, productIdsArray) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");
//   throwIfTrue(!Array.isArray(productIdsArray), "productIds must be an array");

//   const SaleTrendDB = await SaleTrendModel(tenantId);

//   // query to pull items where product_unique_id is in productIdsArray
//   const updatedTrend = await SaleTrendDB.findOneAndUpdate(
//     { trend_unique_id: trendId },
//     {
//       $pull: {
//         trend_products: {
//           product_unique_id: { $in: productIdsArray },
//         },
//       },
//     },
//     { new: true }
//   );

//   throwIfTrue(!updatedTrend, "Sale Trend not found");
//   return updatedTrend;
// };
