import OrdersModel from "../Orders/orderModel";

const GetOrdersDashBoard = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let {
    from,
    to,
    payment_status,
    order_type,
    cash_on_delivery,
    payment_method,
  } = filters;

  const OrderModelDB = await OrdersModel(tenantId);

  // Apply filters
  const baseQuery = {};

  if (payment_status) baseQuery.payment_status = payment_status;
  if (order_type) baseQuery.order_type = order_type;
  if (payment_method) baseQuery.payment_method = payment_method;

  if (cash_on_delivery !== undefined) {
    baseQuery.cash_on_delivery =
      cash_on_delivery === "true"
        ? true
        : cash_on_delivery === "false"
        ? false
        : cash_on_delivery;
  }

  if (from && to) {
    baseQuery.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Required order_status values
  const statusList = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

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
        value: { $sum: "$grand_total" }, // change field if needed
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

export default GetOrdersDashBoard;
