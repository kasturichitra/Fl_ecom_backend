import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { getDateRangeInDays } from "../utils/getDateRangeInDays.js";

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

  let { from, to, payment_status, order_status } = filters;

  const { orderModelDB, offlineOrderModelDB } = await getTenantModels(tenantId);

  // --------------------
  // COMMON DATE FILTER
  // --------------------
  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);

  // --------------------
  // ONLINE ORDER QUERY
  // --------------------
  const onlineMatch = {};
  if (payment_status) onlineMatch.payment_status = payment_status;
  if (order_status) onlineMatch.order_status = order_status;
  if (from || to) onlineMatch.createdAt = dateFilter;

  // --------------------
  // OFFLINE ORDER QUERY
  // --------------------
  const offlineMatch = {};
  if (from || to) offlineMatch.createdAt = dateFilter;

  // --------------------
  // AGGREGATIONS
  // --------------------
  const [onlineStats] = await orderModelDB.aggregate([
    { $match: onlineMatch },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        value: { $sum: "$total_amount" },
      },
    },
  ]);

  const [offlineStats] = await offlineOrderModelDB.aggregate([
    { $match: offlineMatch },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        value: { $sum: "$total_amount" },
      },
    },
  ]);

  // --------------------
  // FINAL RESPONSE
  // --------------------
  return {
    data: {
      online: {
        count: onlineStats?.count || 0,
        value: onlineStats?.value || 0,
      },
      offline: {
        count: offlineStats?.count || 0,
        value: offlineStats?.value || 0,
      },
    },
  };
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

export const getAllLowStockProductsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { productModelDB } = await getTenantModels(tenantId);

  const {
    threshold = 10, // Optional: override product's low_stock_threshold
    category_unique_id,
    industry_unique_id,
    brand_unique_id,
    page = 1,
    limit = 10,
    sort,
    search,
    year,
    from,
    to,
  } = filters;

  const numericLimit = Number(limit);
  const skip = (Number(page) - 1) * numericLimit;

  /** ---------------- Base Filters ---------------- */
  const baseQuery = {};

  if (category_unique_id) baseQuery.category_unique_id = category_unique_id;
  if (industry_unique_id) baseQuery.industry_unique_id = industry_unique_id;
  if (brand_unique_id) baseQuery.brand_unique_id = brand_unique_id;

  // Date filters - prioritize from/to over year
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    baseQuery.createdAt = { $gte: fromDate, $lte: toDate };
  } else if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    baseQuery.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (search?.trim()) {
    const searchRegex = { $regex: search.trim(), $options: "i" };
    baseQuery.$or = [{ product_name: searchRegex }, { product_unique_id: searchRegex }];
  }

  /** ---------------- Low Stock Query ---------------- */
  const lowStockQuery = {
    ...baseQuery,
    // Use custom threshold OR compare stock_quantity with product's own low_stock_threshold
    ...(threshold
      ? { stock_quantity: { $lte: Number(threshold) } }
      : { $expr: { $lte: ["$stock_quantity", "$low_stock_threshold"] } }),
  };

  const sortObj = buildSortObject(sort);

  /** ---------------- Parallel Queries ---------------- */
  const numericThreshold = threshold ? Number(threshold) : undefined;

  const [products, totalCount, lowStockCount, outOfStockCount, healthyStockCount] = await Promise.all([
    productModelDB.find(lowStockQuery).sort(sortObj).skip(skip).limit(numericLimit).lean(),

    productModelDB.countDocuments(lowStockQuery),

    // Low stock count (using same logic as main query)
    numericThreshold !== undefined
      ? productModelDB.countDocuments({
          ...baseQuery,
          stock_quantity: { $lte: numericThreshold },
        })
      : productModelDB.countDocuments({
          ...baseQuery,
          $expr: { $lte: ["$stock_quantity", "$low_stock_threshold"] },
        }),

    // Out of stock (exactly 0)
    productModelDB.countDocuments({
      ...baseQuery,
      stock_quantity: 0,
    }),

    // Healthy stock
    numericThreshold !== undefined
      ? productModelDB.countDocuments({
          ...baseQuery,
          stock_quantity: { $gt: numericThreshold },
        })
      : productModelDB.countDocuments({
          ...baseQuery,
          $expr: { $gt: ["$stock_quantity", "$low_stock_threshold"] },
        }),
  ]);

  return {
    data: products,
    lowStockCount,
    outOfStockCount,
    healthyStockCount,
    totalCount,
    page: Number(page),
    limit: numericLimit,
    totalPages: Math.ceil(totalCount / numericLimit),
  };
};

export const getAllDeadStockService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { productModelDB } = await getTenantModels(tenantId);

  const {
    category_unique_id,
    industry_unique_id,
    brand_unique_id,
    page = 1,
    limit = 10,
    search,
    year,
    from,
    to,
    sort,
  } = filters;

  const numericLimit = Number(limit);
  const skip = (Number(page) - 1) * numericLimit;

  /* ---------------- DEAD STOCK DATE ---------------- */
  let deadFromDate;

  if (from && to) {
    deadFromDate = new Date(from);
  } else if (year) {
    deadFromDate = new Date(`${year}-01-01T00:00:00.000Z`);
  } else {
    deadFromDate = new Date();
    deadFromDate.setDate(deadFromDate.getDate() - 30);
  }

  /* ---------------- PRODUCT FILTERS ---------------- */
  const productMatch = { stock_quantity: { $gt: 0 } };

  if (category_unique_id) productMatch.category_unique_id = category_unique_id;

  if (industry_unique_id) productMatch.industry_unique_id = industry_unique_id;

  if (brand_unique_id) productMatch.brand_unique_id = brand_unique_id;

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    productMatch.$or = [{ product_name: regex }, { product_unique_id: regex }];
  }

  /* ---------------- BASE PIPELINE (NO PAGINATION) ---------------- */
  const basePipeline = [
    { $match: productMatch },

    /* ONLINE ORDERS */
    {
      $lookup: {
        from: "orders",
        let: { pid: "$product_unique_id" },
        pipeline: [
          { $unwind: "$order_products" },
          {
            $match: {
              $expr: {
                $eq: ["$order_products.product_unique_id", "$$pid"],
              },
            },
          },
          {
            $project: {
              soldAt: "$createdAt",
              qty: "$order_products.quantity",
            },
          },
        ],
        as: "onlineSales",
      },
    },

    /* OFFLINE ORDERS */
    {
      $lookup: {
        from: "offlineorders",
        let: { pid: "$product_unique_id" },
        pipeline: [
          { $unwind: "$order_products" },
          {
            $match: {
              $expr: {
                $eq: ["$order_products.product_unique_id", "$$pid"],
              },
            },
          },
          {
            $project: {
              soldAt: "$createdAt",
              qty: "$order_products.quantity",
            },
          },
        ],
        as: "offlineSales",
      },
    },

    /* MERGE SALES */
    {
      $addFields: {
        allSales: {
          $concatArrays: ["$onlineSales", "$offlineSales"],
        },
      },
    },

    /* SALES SUMMARY */
    {
      $addFields: {
        lastSoldAt: { $max: "$allSales.soldAt" },
        totalSoldQty: { $sum: "$allSales.qty" },
      },
    },

    /* DEAD STOCK CONDITION */
    {
      $match: {
        $or: [{ lastSoldAt: null }, { lastSoldAt: { $lt: deadFromDate } }],
      },
    },
  ];

  /* ---------------- FACET FOR PAGINATION ---------------- */
  const sortObj = buildSortObject(sort);
  const pipeline = [
    ...basePipeline,
    {
      $facet: {
        data: [
          {
            $project: {
              product_unique_id: 1,
              product_name: 1,
              category_unique_id: 1,
              industry_unique_id: 1,
              brand_unique_id: 1,
              stock_quantity: 1,
              lastSoldAt: 1,
              totalSoldQty: { $ifNull: ["$totalSoldQty", 0] },
              product_price: { $ifNull: ["$final_price", 0] },
              deadStockValue: {
                $multiply: ["$stock_quantity", "$final_price"],
              },
            },
          },
          { $sort: sortObj },
          { $skip: skip },
          { $limit: numericLimit },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  /* ---------------- EXECUTE ---------------- */

  const result = await productModelDB.aggregate(pipeline);

  const data = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  return {
    data,
    totalCount,
    page: Number(page),
    limit: numericLimit,
    totalPages: Math.ceil(totalCount / numericLimit),
  };
};

export const getFastMovingProductsService = async (tenantId, filters) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { orderModelDB, offlineOrderModelDB } = await getTenantModels(tenantId);

  let { page, limit, from, to, year, searchTerm, sort = "total_revenue:desc" } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const skip = (page - 1) * limit;

  // -------------------------
  // Build date match query
  // -------------------------
  const matchQuery = {};

  if (from && to) {
    matchQuery.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  } else if (year) {
    matchQuery.createdAt = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };
  }

  const daysDifference = getDateRangeInDays({ from, to, year });

  const sortObj = buildSortObject(sort);

  // -------------------------
  // Build aggregation pipeline
  // -------------------------
  const buildBasePipeline = () => {
    const pipeline = [{ $match: matchQuery }, { $unwind: "$order_products" }];

    // ✅ search filter AFTER unwind
    if (searchTerm && searchTerm.trim()) {
      const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      pipeline.push({
        $match: {
          $or: [
            {
              "order_products.product_name": {
                $regex: safeSearch,
                $options: "i",
              },
            },
            {
              "order_products.product_unique_id": {
                $regex: safeSearch,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    pipeline.push({
      $group: {
        _id: "$order_products.product_unique_id",
        product_name: { $first: "$order_products.product_name" },
        product_price: { $first: "$order_products.unit_final_price" },
        total_sold_quantity: { $sum: "$order_products.quantity" },
        total_revenue: { $sum: "$order_products.total_final_price" },
      },
    });

    // Add average sales per day
    pipeline.push({
      $addFields: {
        avg_sales_per_day: {
          $divide: ["$total_sold_quantity", daysDifference],
        },
      },
    });

    // Apply sorting here so that it is applied on grouped fields
    pipeline.push({ $sort: sortObj });

    return pipeline;
  };

  const basePipeline = buildBasePipeline();

  const finalPipeline = [
    ...basePipeline,

    // Merge offline orders
    {
      $unionWith: {
        coll: offlineOrderModelDB.collection.name,
        pipeline: basePipeline,
      },
    },

    // Merge product totals from both sources
    {
      $group: {
        _id: "$_id",
        product_name: { $first: "$product_name" },
        product_price: { $first: "$product_price" },
        total_sold_quantity: { $sum: "$total_sold_quantity" },
        total_revenue: { $sum: "$total_revenue" },
      },
    },

    // Compute averages AFTER merging
    {
      $addFields: {
        avg_sales_per_day: {
          $divide: ["$total_sold_quantity", daysDifference],
        },
      },
    },

    // Global sorting
    { $sort: sortObj },

    // Pagination LAST
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline = [
    ...basePipeline,
    {
      $unionWith: {
        coll: offlineOrderModelDB.collection.name,
        pipeline: basePipeline,
      },
    },
    {
      $group: { _id: "$_id" },
    },
    { $count: "total" },
  ];

  const countResult = await orderModelDB.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;

  const results = await orderModelDB.aggregate(finalPipeline);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: results,
  };
};

// export const getFastMovingProductsService = async (tenantId, filters) => {
//   throwIfTrue(!tenantId, "Tenant ID is Required");

//   const { orderModelDB, productModelDB, offlineOrderModelDB } = await getTenantModels(tenantId);

//   const { page = 1, limit = 10, from, to, year, searchTerm } = filters;
//   const numericLimit = Number(limit);
//   const skip = (Number(page) - 1) * numericLimit;
//   const matchQuery = {};

//   // Date filters - prioritize from/to over year
//   if (from && to) {
//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     matchQuery.createdAt = { $gte: fromDate, $lte: toDate };
//   } else if (year) {
//     const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
//     const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
//     matchQuery.createdAt = { $gte: startDate, $lte: endDate };
//   }

//   // Aggregate online orders
//   const pipeline = [
//     { $match: matchQuery },
//     { $unwind: "$order_products" },
//     {
//       $group: {
//         _id: "$order_products.product_unique_id",
//         product_name: { $first: "$order_products.product_name" },
//         total_sold_quantity: { $sum: "$order_products.quantity" },
//         total_revenue: { $sum: "$order_products.total_final_price" },
//       },
//     },
//   ];

//   const [onlineResults, offlineResults] = await Promise.all([
//     orderModelDB.aggregate(pipeline),
//     offlineOrderModelDB.aggregate(pipeline),
//   ]);
//   // Combine online and offline results
//   const combinedResultsMap = new Map();
//   [...onlineResults, ...offlineResults].forEach((item) => {
//     if (combinedResultsMap.has(item._id)) {
//       const existing = combinedResultsMap.get(item._id);
//       existing.total_sold_quantity += item.total_sold_quantity;
//       existing.total_revenue += item.total_revenue;
//     } else {
//       combinedResultsMap.set(item._id, { ...item });
//     }
//   });
//   const combinedResults = Array.from(combinedResultsMap.values());

//   const sortedResults = combinedResults.sort((a, b) => b.total_sold_quantity - a.total_sold_quantity);
//   const paginatedResults = sortedResults.slice(skip, skip + numericLimit);
//   const totalCount = combinedResults.length;

//   return {
//     data: paginatedResults,
//     totalCount,
//     page: Number(page),
//     limit: numericLimit,
//     totalPages: Math.ceil(totalCount / numericLimit),
//   };
// };

//offline orders aggregations

export const getAllofflinePamentTransactionService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { offlineOrderTransactionsModelDB } = await getTenantModels(tenantId);
  const { from, to, page = 1, limit = 10 } = filters;

  const numericLimit = Number(limit);
  const skip = (Number(page) - 1) * numericLimit;

  const matchQuery = {};
  if (from || to) {
    matchQuery.createdAt = {};
    if (from) matchQuery.createdAt.$gte = new Date(from);
    if (to) matchQuery.createdAt.$lte = new Date(to);
  }
  const existingMethods = await offlineOrderTransactionsModelDB.distinct("payment_method");
  const pipeline = [
    ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
    {
      $group: {
        _id: "$payment_method",
        count: { $sum: 1 },
        total_amount: { $sum: "$amount" },
      },
    },
  ];
  const aggregationResult = await offlineOrderTransactionsModelDB.aggregate(pipeline);

  const allMethods = existingMethods.map((method) => ({
    payment_method: method,
    count: 0,
    value: 0,
  }));
  aggregationResult.forEach((result) => {
    const method = allMethods.find((m) => m.payment_method === result._id);
    if (method) {
      method.count = result.count;
      method.value = result.total_amount;
    }
  });
  return allMethods;
};
