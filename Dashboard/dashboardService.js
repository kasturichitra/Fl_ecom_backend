import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const getOrdersByStatus = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { from, to, payment_status, order_type, cash_on_delivery, payment_method } = filters;

  const { orderModelDB } = await getTenantModels(tenantId);

  // Apply filters
  const baseQuery = {};

  if (payment_status) baseQuery.payment_status = payment_status;
  if (order_type) baseQuery.order_type = order_type;
  if (payment_method) baseQuery.payment_method = payment_method;

  if (cash_on_delivery === "true") {
    baseQuery.cash_on_delivery = true;
  } else if (cash_on_delivery === "false") {
    baseQuery.cash_on_delivery = false;
  }

  if (from) {
    baseQuery.createdAt = {
      $gte: new Date(from),
    };
  }

  if (to) {
    baseQuery.createdAt = {
      $lte: new Date(to),
    };
  }

  if (from && to) {
    baseQuery.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Required order_status values
  const statusList = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];

  // Initialize dashboard result
  const dashboardResult = {};
  statusList.forEach((status) => {
    dashboardResult[status.toLowerCase()] = { count: 0, value: 0 };
  });

  // AGGREGATION: GROUP BY DERIVED ORDER_STATUS
  const stats = await orderModelDB.aggregate([
    { $match: baseQuery },
    {
      $addFields: {
        last_history: { $arrayElemAt: ["$order_status_history", -1] },
      },
    },
    {
      $addFields: {
        computed_status: { $ifNull: ["$order_status", "$last_history.status"] },
      },
    },
    {
      $group: {
        _id: "$computed_status",
        count: { $sum: 1 },
        value: { $sum: "$total_amount" },
      },
    },
  ]);

  // Map DB results to output
  stats.forEach((item) => {
    const key = item._id?.toLowerCase();
    if (dashboardResult[key]) {
      dashboardResult[key].count = item.count;
      dashboardResult[key].value = item.value;
    }
  });

  return dashboardResult;
};

export const getOrdersByPaymentMethod = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { from, to, order_status, order_type, cash_on_delivery } = filters;

  const { orderModelDB, paymentTransactionsModelDB } = await getTenantModels(tenantId);

  // Apply filters
  const baseQuery = {};

  if (order_status) baseQuery.order_status = order_status;
  if (order_type) baseQuery.order_type = order_type;

  if (cash_on_delivery === "true") {
    baseQuery.cash_on_delivery = true;
  } else if (cash_on_delivery === "false") {
    baseQuery.cash_on_delivery = false;
  }

  if (from) {
    baseQuery.createdAt = {
      $gte: new Date(from),
    };
  }

  if (to) {
    baseQuery.createdAt = {
      $lte: new Date(to),
    };
  }

  if (from && to) {
    baseQuery.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Fetch unique payment methods from transactions
  const uniqueMethods = await paymentTransactionsModelDB.distinct("payment_method");

  // Initialize result object with unique methods found in DB
  const paymentMethodResult = {
    // unknown: { count: 0, value: 0 },
  };

  
  uniqueMethods.forEach((method) => {
    if (method) {
      const key = method;
      paymentMethodResult[key] = { count: 0, value: 0 };
    }
  });
  console.log("paymentMethodResult", uniqueMethods);



  // AGGREGATE BY PAYMENT METHOD
  const stats = await orderModelDB.aggregate([
    { $match: baseQuery },
    // Handle status filtering robustly for legacy orders
    {
      $addFields: {
        last_history: { $arrayElemAt: ["$order_status_history", -1] },
      },
    },
    {
      $addFields: {
        computed_status: { $ifNull: ["$order_status", "$last_history.status"] },
      },
    },
    ...(order_status ? [{ $match: { computed_status: order_status } }] : []),
    // Join with transactions using order_id (more reliable than transaction_id)
    {
      $lookup: {
        from: "paymenttransactions",
        localField: "order_id",
        foreignField: "order_id",
        as: "transaction_details",
      },
    },
    {
      $addFields: {
        payment_method_val: { $arrayElemAt: ["$transaction_details.payment_method", 0] },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$payment_method_val", "Unknown"] },
        count: { $sum: 1 },
        value: { $sum: "$total_amount" },
      },
    },
  ]);

  console.log("stats==>", stats);

  // Map DB results
  stats.forEach((item) => {
    // const key = item._id?.toLowerCase().replace(/ /g, "_");
    const key = item._id; 
    if (key) {
      if (!paymentMethodResult[key]) {
        paymentMethodResult[key] = { count: 0, value: 0 };
      }
      paymentMethodResult[key].count = item.count;
      paymentMethodResult[key].value = item.value;
    }
  });

  return { data: paymentMethodResult };
};

export const getOrdersByOrderType = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { from, to, payment_status, payment_method, cash_on_delivery, order_status } = filters;

  const { orderModelDB } = await getTenantModels(tenantId);

  // Build query
  const baseQuery = {};

  if (payment_status) baseQuery.payment_status = payment_status;
  if (payment_method) baseQuery.payment_method = payment_method;
  if (order_status) baseQuery.order_status = order_status;

  if (cash_on_delivery === "true") {
    baseQuery.cash_on_delivery = true;
  } else if (cash_on_delivery === "false") {
    baseQuery.cash_on_delivery = false;
  }

  if (from) {
    baseQuery.createdAt = {
      $gte: new Date(from),
    };
  }

  if (to) {
    baseQuery.createdAt = {
      $lte: new Date(to),
    };
  }

  if (from && to) {
    baseQuery.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Available order types
  const orderTypeList = ["Online", "Offline"];

  // Setup dashboard response
  const orderTypeResult = {};
  orderTypeList.forEach((type) => {
    orderTypeResult[type.toLowerCase()] = {
      count: 0,
      value: 0,
    };
  });

  // Aggregate by order_type
  const stats = await orderModelDB.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$order_type",
        count: { $sum: 1 },
        value: { $sum: "$total_amount" }, // change if needed
      },
    },
  ]);

  // Fill output
  stats.forEach((item) => {
    const key = item._id?.toLowerCase();
    if (orderTypeResult[key]) {
      orderTypeResult[key].count = item.count;
      orderTypeResult[key].value = item.value;
    }
  });

  return { data: orderTypeResult };
};

export const getOrdersTrendService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { period, year, from, to } = filters;

  // Get the Orders model for this tenant
  const { orderModelDB } = await getTenantModels(tenantId);

  // Build the match criteria
  let matchCriteria = {};

  // Add year filter if provided
  if (year) {
    const yearInt = parseInt(year);
    matchCriteria.createdAt = {
      $gte: new Date(`${yearInt}-01-01T00:00:00.000Z`),
      $lte: new Date(`${yearInt}-12-31T23:59:59.999Z`),
    };
  }

  // Add date range filters if provided (only if year is not specified)
  else if (from || to) {
    matchCriteria.createdAt = {};
    if (from) {
      matchCriteria.createdAt.$gte = new Date(from);
    }
    if (to) {
      matchCriteria.createdAt.$lte = new Date(to);
    }
  }

  // Aggregation pipeline to group by month
  const pipeline = [
    // Match the filter criteria
    ...(Object.keys(matchCriteria).length > 0 ? [{ $match: matchCriteria }] : []),

    // Group by month
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
        value: { $sum: "$total_amount" },
      },
    },

    // Project to rename _id to month
    {
      $project: {
        _id: 0,
        month: "$_id",
        count: 1,
        value: 1,
      },
    },

    // Sort by month
    {
      $sort: { month: 1 },
    },
  ];

  const aggregationResult = await orderModelDB.aggregate(pipeline);

  // Initialize all 12 months with default values
  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
    value: 0,
  }));

  // Merge aggregation results with default values
  aggregationResult.forEach((item) => {
    const monthIndex = item.month - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      allMonths[monthIndex] = {
        month: item.month,
        count: item.count,
        value: item.value,
      };
    }
  });

  return allMonths;
};

export const getUsersTrendService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { period, year, from, to } = filters;

  const { userModelDB } = await getTenantModels(tenantId);

  let matchCriteria = {
    role: "user",
  };

  // Add year filter if provided
  if (year) {
    const yearInt = parseInt(year);
    matchCriteria.createdAt = {
      $gte: new Date(`${yearInt}-01-01T00:00:00.000Z`),
      $lte: new Date(`${yearInt}-12-31T23:59:59.999Z`),
    };
  }
  // Add date range filters if provided (only if year is not specified)
  else if (from || to) {
    matchCriteria.createdAt = {};
    if (from) {
      matchCriteria.createdAt.$gte = new Date(from);
    }
    if (to) {
      matchCriteria.createdAt.$lte = new Date(to);
    }
  }

  const pipeline = [
    // Match the filter criteria
    ...(Object.keys(matchCriteria).length > 0 ? [{ $match: matchCriteria }] : []),

    // Group by month
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
        // value: { $sum: "$total_amount" },
      },
    },

    // Project to rename _id to month
    {
      $project: {
        _id: 0,
        month: "$_id",
        count: 1,
        // value: 1,
      },
    },

    // Sort by month
    {
      $sort: { month: 1 },
    },
  ];

  const aggregationResult = await userModelDB.aggregate(pipeline);

  const allMonths = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    count: 0,
    // value: 0,
  }));

  aggregationResult.forEach((result) => {
    const monthIndex = result.month - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      allMonths[monthIndex] = {
        month: result.month,
        count: result.count,
      };
    }
  });

  return allMonths;
};

export const getTopBrandsByCategoryService = async (tenantID, filters = {}) => {
  const { orderModelDB } = await getTenantModels(tenantID);
  const { category_unique_id, from, to } = filters;

  // normalize the ID – prevent "" or " "
  const categoryId = category_unique_id?.trim?.() || "";

  const matchQuery = {};

  if (from || to) {
    matchQuery.createdAt = {};
    if (from) matchQuery.createdAt.$gte = new Date(from);
    if (to) matchQuery.createdAt.$lte = new Date(to);
  }

  const pipeline = [
    ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
    // 1. Only Delivered Orders
    // TODO: Later add the delivered only filter to ensure only delivered orders are considered
    // {
    //   $match: {
    //     order_status: "Delivered",
    //   },
    // },

    // 2. Unwind order products
    {
      $unwind: "$order_products",
    },

    // 3. Lookup Products
    {
      $lookup: {
        from: "products",
        let: {
          productUniqueId: "$order_products.product_unique_id",
          selectedCategory: String(categoryId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Match products based on product_unique_id
                  {
                    $eq: ["$product_unique_id", "$$productUniqueId"],
                  },

                  // Only filter category when user selected one
                  ...(categoryId !== ""
                    ? [
                        {
                          $eq: [
                            { $toString: "$category_unique_id" }, // convert DB value → string
                            "$$selectedCategory", // already string
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
          {
            $project: {
              category_unique_id: 1,
              brand_unique_id: 1,
              category_name: 1,
              brand_name: 1,
            },
          },
        ],
        as: "productDetails",
      },
    },

    // 4. Unwind productDetails
    {
      $unwind: "$productDetails",
    },

    // 5. Group by brand only (not by category)
    {
      $group: {
        _id: "$productDetails.brand_unique_id",
        brand_name: { $first: "$productDetails.brand_name" },
        count: { $sum: "$order_products.quantity" },
      },
    },

    // 6. Sort by count DESC
    { $sort: { count: -1 } },

    // 7. Limit to top 5 brands
    { $limit: 5 },

    // 8. Project to final format
    {
      $project: {
        _id: 0,
        brand_name: 1,
        count: 1,
      },
    },
  ];

  const brands = await orderModelDB.aggregate(pipeline);

  return { brands };
};

export const getTopProductsByCategoryService = async (tenantID, filters = {}) => {
  const { orderModelDB } = await getTenantModels(tenantID);
  const { category_unique_id, from, to } = filters;

  // normalize the ID – prevent "" or " "
  const categoryId = category_unique_id?.trim?.() || "";

  const matchQuery = {
    order_status: "Delivered",
  };

  if (from || to) {
    matchQuery.createdAt = {};
    if (from) matchQuery.createdAt.$gte = new Date(from);
    if (to) matchQuery.createdAt.$lte = new Date(to);
  }

  const pipeline = [
    // 1. Filter only delivered orders + date range
    {
      $match: matchQuery,
    },
    // 2. Unwind order_products
    {
      $unwind: "$order_products",
    },
    // 3. Lookup product details
    {
      $lookup: {
        from: "products",
        let: {
          productUniqueId: "$order_products.product_unique_id",
          selectedCategory: String(categoryId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product_unique_id", "$$productUniqueId"] },
                  // Only filter category when user selected one
                  ...(categoryId !== ""
                    ? [
                        {
                          $eq: [{ $toString: "$category_unique_id" }, "$$selectedCategory"],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
          {
            $project: {
              category_unique_id: 1,
              product_unique_id: 1,
              product_name: 1,
              category_name: 1,
            },
          },
        ],
        as: "productDetails",
      },
    },
    // 4. Unwind productDetails
    {
      $unwind: "$productDetails",
    },
    // 5. Group by product only (not by category)
    {
      $group: {
        _id: "$productDetails.product_unique_id",
        product_name: { $first: "$productDetails.product_name" },
        count: { $sum: "$order_products.quantity" },
      },
    },
    // 6. Sort by count descending
    {
      $sort: { count: -1 },
    },
    // 7. Limit to top 5 products
    { $limit: 5 },
    // 8. Project to final format
    {
      $project: {
        _id: 0,
        product_name: 1,
        count: 1,
      },
    },
  ];

  const products = await orderModelDB.aggregate(pipeline);
  return { products };
};

export const getTotalCountsService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const {
    orderModelDB,
    industryTypeModelDB,
    categoryModelDB,
    productModelDB,
    brandModelDB,
    userModelDB,
    couponModelDB,
    notificationModelDB,
    saleTrendModelDB,
    businessModelDB,
    ticketModelDB,
  } = await getTenantModels(tenantId);

  // Fetch all statistics concurrently for maximum performance
  const [
    orderStats,
    industryStats,
    categoryStats,
    productStats,
    brandStats,
    userStats,
    couponStats,
    notificationStats,
    saleTrendStats,
    businessStats,
    ticketStats,
  ] = await Promise.all([
    // 1. Order Collection Stats
    orderModelDB.aggregate([
      {
        $addFields: {
          last_history: { $arrayElemAt: ["$order_status_history", -1] },
        },
      },
      {
        $addFields: {
          computed_status: { $ifNull: ["$order_status", "$last_history.status"] },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          offlineOrders: { $sum: { $cond: [{ $eq: ["$order_type", "Offline"] }, 1, 0] } },
          onlineOrders: { $sum: { $cond: [{ $eq: ["$order_type", "Online"] }, 1, 0] } },
          totalProductsSold: { $sum: { $sum: "$order_products.quantity" } },
          pendingCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Pending"] }, 1, 0] } },
          processingCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Processing"] }, 1, 0] } },
          shippedCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Shipped"] }, 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Delivered"] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Cancelled"] }, 1, 0] } },
          returnedCount: { $sum: { $cond: [{ $eq: ["$computed_status", "Returned"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 2. Industry Type Collection Stats
    industryTypeModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 3. Category Collection Stats
    categoryModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 4. Product Collection Stats
    productModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 5. Brand Collection Stats
    brandModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 6. User Collection Stats (Refactored to split Users and Employees)
    userModelDB.aggregate([
      {
        $group: {
          _id: null,
          // Users
          userTotal: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
          userActive: {
            $sum: { $cond: [{ $and: [{ $eq: ["$role", "user"] }, { $eq: ["$is_active", true] }] }, 1, 0] },
          },
          userInactive: {
            $sum: { $cond: [{ $and: [{ $eq: ["$role", "user"] }, { $eq: ["$is_active", false] }] }, 1, 0] },
          },
          // Employees
          employeeTotal: { $sum: { $cond: [{ $eq: ["$role", "employee"] }, 1, 0] } },
          employeeActive: {
            $sum: { $cond: [{ $and: [{ $eq: ["$role", "employee"] }, { $eq: ["$is_active", true] }] }, 1, 0] },
          },
          employeeInactive: {
            $sum: { $cond: [{ $and: [{ $eq: ["$role", "employee"] }, { $eq: ["$is_active", false] }] }, 1, 0] },
          },
          // Admins (Optional, keeping for completeness if needed later or just ignore)
          // adminTotal: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 7. Coupon Collection Stats
    couponModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 8. Notification Collection Stats
    notificationModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 9. Sale Trend Collection Stats
    saleTrendModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 10. Business Collection Stats
    businessModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$is_active", false] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ["$is_verified", true] }, 1, 0] } },
          not_verified: { $sum: { $cond: [{ $ne: ["$is_verified", true] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    // 11. Ticket Collection Stats
    ticketModelDB.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          not_resolved: { $sum: { $cond: [{ $ne: ["$status", "resolved"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  // Helper patterns for defaults
  const activeInactiveDefault = { total: 0, active: 0, inactive: 0 };
  const businessDefault = { total: 0, active: 0, inactive: 0, verified: 0, not_verified: 0 };
  const ticketDefault = { total: 0, resolved: 0, not_resolved: 0, pending: 0, assigned: 0, in_progress: 0 };

  const userStatsResult = userStats[0] || {
    userTotal: 0,
    userActive: 0,
    userInactive: 0,
    employeeTotal: 0,
    employeeActive: 0,
    employeeInactive: 0,
  };

  return {
    orderCounts: orderStats[0] || {
      totalOrders: 0,
      offlineOrders: 0,
      onlineOrders: 0,
      totalProductsSold: 0,
      pendingCount: 0,
      processingCount: 0,
      shippedCount: 0,
      deliveredCount: 0,
      cancelledCount: 0,
      returnedCount: 0,
    },
    industryCounts: industryStats[0] || activeInactiveDefault,
    categoryCounts: categoryStats[0] || activeInactiveDefault,
    productCounts: productStats[0] || activeInactiveDefault,
    brandCounts: brandStats[0] || activeInactiveDefault,
    ticketCounts: ticketStats[0] || ticketDefault,
    userCounts: {
      total: userStatsResult.userTotal,
      active: userStatsResult.userActive,
      inactive: userStatsResult.userInactive,
    },
    employeeCounts: {
      total: userStatsResult.employeeTotal,
      active: userStatsResult.employeeActive,
      inactive: userStatsResult.employeeInactive,
    },
    couponCounts: couponStats[0] || activeInactiveDefault,
    notificationCounts: notificationStats[0] || { total: 0, unread: 0 },
    saleTrendCounts: saleTrendStats[0] || activeInactiveDefault,
    businessCounts: businessStats[0] || businessDefault,
  };
};
