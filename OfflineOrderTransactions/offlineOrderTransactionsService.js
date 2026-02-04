import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { isValidDateString } from "../utils/isValidDateString.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getAllOfflineOrderTransactionsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let {
    payment_method,
    order_id,
    transaction_id,
    page,
    limit,
    searchTerm,
    from,
    to,
    sort = "createdAt:desc",
  } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const skip = (page - 1) * limit;

  const query = {};

  if (payment_method) query.payment_method = payment_method;
  if (order_id) query.order_id = order_id;
  if (transaction_id) query.transaction_id = transaction_id;

  if (searchTerm)
    query.$or = [
      { order_id: { $regex: searchTerm, $options: "i" } },
      { transaction_id: { $regex: searchTerm, $options: "i" } },
    ];

  if (from && isValidDateString(from)) query.createdAt = { $gte: new Date(from) };
  if (to && isValidDateString(to)) query.createdAt = { ...query.createdAt, $lte: new Date(to) };

  const sortObj = buildSortObject(sort);

  const { offlineOrderTransactionsModelDB } = await getTenantModels(tenantId);

  const pipeline = [
    { $match: query },
    { $sort: sortObj },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await offlineOrderTransactionsModelDB.aggregate(pipeline);

  const offlineOrderTransactions = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  return {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    data: offlineOrderTransactions,
  };
};
