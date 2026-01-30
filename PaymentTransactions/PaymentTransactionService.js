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
  //   if (currency) query.currency = currency;
  //   if (gateway) query.gateway = gateway;
  //   if (order_id) query.order_id = order_id;
  //   if (user_id) query.user_id = user_id;

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
      //   { currency: { $regex: searchTerm, $options: "i" } },
      //   { gateway: { $regex: searchTerm, $options: "i" } },
      //   { user_id: { $regex: searchTerm, $options: "i" } },
      //   { order_id: { $regex: searchTerm, $options: "i" } },
    ];
  }

  /* -------------------- SORT -------------------- */
  const sortObj = buildSortObject(sort);

  /* -------------------- AGGREGATION -------------------- */
  const pipeline = [
    { $match: query },

    {
      $group: {
        _id: "$payment_status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }, // optional useful metric
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

    { $sort: sortObj },
  ];

  /* -------------------- EXECUTION (TENANT DB) -------------------- */
  const result = await paymentTransactionsModelDB.aggregate(pipeline);

  console.log("result", result);

  const defaultStatuses = ["Pending", "Paid", "Failed", "Refunded"];

  const statusMap = {};
  result.forEach((r) => {
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

  const data = result[0]?.data || [];

  console.log("Resuilt", result);
  console.log("final Result", finalResult); 
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  /* -------------------- RESPONSE -------------------- */
  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data,
    finalResult,
  };
};

const getPaymentTransactionByIdService = async (tenantId, id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { paymentTransactionsModelDB } = await getTenantModels(tenantId);
  // const result = await paymentTransactionsModelDB.findById(id).lean();
  // return result;

  const PaymentTransaction = await paymentTransactionsModelDB.aggregate([{}]);
  return PaymentTransaction;
};
