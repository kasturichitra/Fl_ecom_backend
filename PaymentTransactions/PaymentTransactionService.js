// import { buildSortObject } from "../utils/buildSortObject";
// import throwIfTrue from "../utils/throwIfTrue."

import { buildSortObject } from "../utils/buildSortObject.js";
import throwIfTrue from "../utils/throwIfTrue.js";
// import PaymentTransactionsModel from "../models/PaymentTransactions.model.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const getAllPaymentTransactionsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { paymentTransactionsModelDB } = await getTenantModels(tenantId);
  console.log(`[DEBUG] Querying payment transactions for tenant:)`, paymentTransactionsModelDB);

  let {
    page = 1,
    limit = 10,
    searchTerm,
    sort = "createdAt:desc",
    from,
    to,
    payment_status,
    payment_method,
    gateway_code,
    key_id,
    is_verified,
    currency,
    gateway,
    order_id,
    user_id,
  } = filters;

  const query = {};

  /* -------------------- PAGINATION -------------------- */
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  /* -------------------- BASIC FILTERS -------------------- */
  if (payment_status) query.payment_status = payment_status;
  if (payment_method) query.payment_method = payment_method;
  if (gateway_code) query.gateway_code = gateway_code;
  if (key_id) query.key_id = key_id;

  if (is_verified === "true") query.is_verified = true;
  if (is_verified === "false") query.is_verified = false;

  /* -------------------- DATE RANGE FILTER -------------------- */
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  /* -------------------- SEARCH -------------------- */
  if (searchTerm) {
    query.$or = [
      { transaction_reference_id: { $regex: searchTerm, $options: "i" } },
      { transaction_id: { $regex: searchTerm, $options: "i" } },
      { gateway_reference_id: { $regex: searchTerm, $options: "i" } },
      { payment_method: { $regex: searchTerm, $options: "i" } },
      { payment_status: { $regex: searchTerm, $options: "i" } },
      { gateway_code: { $regex: searchTerm, $options: "i" } },
    ];
  }

  /* -------------------- SORT -------------------- */
  const sortObj = buildSortObject(sort);

  /* -------------------- AGGREGATION (RECORDS + STATS) -------------------- */
  const pipeline = [
    { $match: query },

    {
      $facet: {
        /* ---------- RECORDS ---------- */
        records: [
          { $sort: sortObj },
          { $skip: skip },
          { $limit: limit },
        ],

        /* ---------- STATUS COUNTS ---------- */
        statusStats: [
          {
            $group: {
              _id: "$payment_status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              payment_status: "$_id",
              count: 1,
              totalAmount: 1,
            },
          },
        ],

        /* ---------- TOTAL COUNT ---------- */
        totalCount: [
          { $count: "count" }
        ]
      }
    }
  ];

//   const pipeline = [
//   {
//     $facet: {
//       records: [
//         { $match: query },
//         { $sort: sortObj },
//         { $skip: skip },
//         { $limit: limit },
//       ],

//       statusStats: [
//         {
//           $group: {
//             _id: "$payment_status",
//             count: { $sum: 1 },
//             totalAmount: { $sum: "$amount" },
//           },
//         },
//       ],

//       totalCount: [
//         { $match: query },
//         { $count: "count" }
//       ]
//     }
//   }
// ];

  
  /* -------------------- EXECUTION (TENANT DB) -------------------- */
  const result = await paymentTransactionsModelDB.aggregate(pipeline);

  /* -------------------- NORMALIZATION -------------------- */
  const defaultStatuses = ["Pending", "Paid", "Failed", "Refunded","Processing"];

  const statusMap = {};
  (result[0]?.statusStats || []).forEach((r) => {
    statusMap[r.payment_status] = {
      count: r.count,
      totalAmount: r.totalAmount,
    };
  });

  const finalResult = defaultStatuses.map((status) => ({
    payment_status: status,
    count: statusMap[status]?.count || 0,
    totalAmount: statusMap[status]?.totalAmount || 0,
  }));

  const data = result[0]?.records || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  /* -------------------- RESPONSE -------------------- */
  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data,            // ✅ filtered records
    finalResult,     // ✅ payment_status stats
  };
};


export const getPaymentTransactionByIdService = async (
  tenantId,
  transaction_reference_id
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!transaction_reference_id, "Transaction reference ID is required");

  const { paymentTransactionsModelDB } = await getTenantModels(tenantId);

  const transaction = await paymentTransactionsModelDB.aggregate([
    {
      $match: { transaction_reference_id },
    },

    /* Optional lookups (future ready)
    {
      $lookup: {
        from: "orders",
        localField: "order_id",
        foreignField: "order_id",
        as: "order",
      },
    },
    {
      $unwind: { path: "$order", preserveNullAndEmptyArrays: true },
    },
    */

    /* Optional computed fields */
    {
      $addFields: {
        is_success: { $eq: ["$payment_status", "Paid"] },
      },
    },

    /* Optional cleanup */
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  return transaction[0] || null;
};


