import OrdersModel from "../Orders/orderModel.js";
import UserModel from "../Users/userModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getOrdersByStatus = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { from, to, payment_status, order_type, cash_on_delivery, payment_method } = filters;

  const OrderModelDB = await OrdersModel(tenantId);

  // Apply filters
  const baseQuery = {};

  if (payment_status) baseQuery.payment_status = payment_status;
  if (order_type) baseQuery.order_type = order_type;
  if (payment_method) baseQuery.payment_method = payment_method;

  if (cash_on_delivery !== undefined) {
    baseQuery.cash_on_delivery =
      cash_on_delivery === "true" ? true : cash_on_delivery === "false" ? false : cash_on_delivery;
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

  // AGGREGATION: GROUP ONLY BY ORDER_STATUS
  const stats = await OrderModelDB.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$order_status",
        count: { $sum: 1 },
        value: { $sum: "$total_amount" }, // change field if needed
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

  const OrderModelDB = await OrdersModel(tenantId);

  // Apply filters
  const baseQuery = {};

  if (order_status) baseQuery.order_status = order_status;
  if (order_type) baseQuery.order_type = order_type;

  if (cash_on_delivery !== undefined) {
    baseQuery.cash_on_delivery =
      cash_on_delivery === "true" ? true : cash_on_delivery === "false" ? false : cash_on_delivery;
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

  // List of all supported payment methods
  const methodList = ["Cash", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"];

  // Initialize result object
  const paymentMethodResult = {};
  methodList.forEach((method) => {
    paymentMethodResult[method.toLowerCase().replace(/ /g, "_")] = {
      count: 0,
      value: 0,
    };
  });

  // AGGREGATE BY PAYMENT METHOD
  const stats = await OrderModelDB.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$payment_method",
        count: { $sum: 1 },
        value: { $sum: "$total_amount" }, // change if needed
      },
    },
  ]);

  // Map DB results
  stats.forEach((item) => {
    const key = item._id?.toLowerCase().replace(/ /g, "_");
    if (paymentMethodResult[key]) {
      paymentMethodResult[key].count = item.count;
      paymentMethodResult[key].value = item.value;
    }
  });

  return { data: paymentMethodResult };
};

export const getOrdersByOrderType = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { from, to, payment_status, payment_method, cash_on_delivery, order_status } = filters;

  const OrderModelDB = await OrdersModel(tenantId);

  // Build query
  const baseQuery = {};

  if (payment_status) baseQuery.payment_status = payment_status;
  if (payment_method) baseQuery.payment_method = payment_method;
  if (order_status) baseQuery.order_status = order_status;

  if (cash_on_delivery !== undefined) {
    baseQuery.cash_on_delivery =
      cash_on_delivery === "true" ? true : cash_on_delivery === "false" ? false : cash_on_delivery;
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
  const stats = await OrderModelDB.aggregate([
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
  const OrderModelDB = await OrdersModel(tenantId);

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

  const aggregationResult = await OrderModelDB.aggregate(pipeline);

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

  const UserModelDB = await UserModel(tenantId);

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

  const aggregationResult = await UserModelDB.aggregate(pipeline);

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
  const Orders = await OrdersModel(tenantID);
  const { category_unique_id } = filters;

  // normalize the ID – prevent "" or " "
  const categoryId = category_unique_id?.trim?.() || "";

  const pipeline = [
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

  const brands = await Orders.aggregate(pipeline);

  return { brands };
};

export const getTopProductsByCategoryService = async (tenantID, filters = {}) => {
  const Orders = await OrdersModel(tenantID);
  const { category_unique_id } = filters;

  // normalize the ID – prevent "" or " "
  const categoryId = category_unique_id?.trim?.() || "";

  const pipeline = [
    // 1. Filter only delivered orders
    {
      $match: {
        order_status: "Delivered",
      },
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

  const products = await Orders.aggregate(pipeline);
  return { products };
};
