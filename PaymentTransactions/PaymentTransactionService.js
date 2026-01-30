// import { buildSortObject } from "../utils/buildSortObject";
// import throwIfTrue from "../utils/throwIfTrue."

import { buildSortObject } from "../utils/buildSortObject.js";
import throwIfTrue from "../utils/throwIfTrue.js";
// import PaymentTransactionsModel from "../models/PaymentTransactions.model.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const getAllPaymentTransactionsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { paymentTransactionsModelDB } = await getTenantModels(tenantId);

  const paymentMethods = await paymentTransactionsModelDB.distinct("payment_method");
  const gateways = await paymentTransactionsModelDB.distinct("gateway");
  const keyIds = await paymentTransactionsModelDB.distinct("key_id");


  let {
    page = 1,
    limit = 10,
    searchTerm,
    sort = "createdAt:desc",
    from,
    to,
    payment_status,
    payment_method,
    // gateway_code,
    key_id,
    is_verified,
    // currency,
    gateway,
    // order_id,
    // user_id,
  } = filters;

  const query = {};

  /* -------------------- PAGINATION -------------------- */
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  /* -------------------- BASIC FILTERS -------------------- */
  if (payment_status) query.payment_status = payment_status;
  if (payment_method) query.payment_method = payment_method;
  // if (gateway_code) query.gateway_code = gateway_code;
  if (gateway) query.gateway = gateway;
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

  /* -------------------- EXECUTION (TENANT DB) -------------------- */
  const result = await paymentTransactionsModelDB.aggregate(pipeline);

  /* -------------------- NORMALIZATION -------------------- */
  const defaultStatuses = ["Pending", "Processing", "Paid", "Failed", "Refunded"];

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

  const paidCount = statusMap["Paid"]?.count || 0;
  const paidAmount = statusMap["Paid"]?.totalAmount || 0;
  finalResult.push({
    payment_status: "Total",
    count: paidCount,
    totalAmount: paidAmount,
  });

  /* -------------------- RESPONSE -------------------- */
  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data,            // ✅ filtered records
    finalResult,     // ✅ payment_status stats
    filtersMeta: {   // ✅ available filter values
      paymentMethods,
      gateways,
      keyIds,
    },
  };
};


// const getPaymentTransactionByIdService = async (tenantId, id) => {
//   throwIfTrue(!tenantId, "Tenant ID is required");

//   const { paymentTransactionsModelDB } = await getTenantModels(tenantId);
//   // const result = await paymentTransactionsModelDB.findById(id).lean();
//   // return result;

//   const PaymentTransaction = await paymentTransactionsModelDB.aggregate([{}]);
//   return PaymentTransaction;
// };
