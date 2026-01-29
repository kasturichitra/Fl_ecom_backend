import { v4 as uuidv4 } from "uuid";

import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { sendAdminNotification, sendUserNotification } from "../utils/notificationHelper.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { validateOrderCreate } from "./validations/validateOrderCreate.js";
import { ADMIN_ID } from "../lib/constants.js";

//   Decrease product stock (called after order is saved)
const updateStockOnOrder = async (tenantId, products) => {
  // const Product = await ProductModel(tenantId);
  const { productModelDB: Product } = await getTenantModels(tenantId);

  const bulkOps = products.map((item) => ({
    updateOne: {
      filter: { product_unique_id: item.product_unique_id },
      update: { $inc: { stock_quantity: -item.quantity } },
    },
  }));

  if (bulkOps.length) await Product.bulkWrite(bulkOps);
};

const verifyOrderProducts = async (tenantId, products) => {
  // const Product = await ProductModel(tenantId);
  const { productModelDB: Product } = await getTenantModels(tenantId);
  const result = await Product.find({ product_unique_id: { $in: products.map((p) => p.product_unique_id) } });
  throwIfTrue(result.length !== products.length, `Some Products are not found`);
};

const clearProductsFromCartAfterOrder = async (tenantId, user_id, products) => {
  // const CartDB = await CartModel(tenantId);
  const { cartModelDB: CartDB } = await getTenantModels(tenantId);

  const productUniqueIdsToRemove = new Set(products.map((p) => p.product_unique_id));

  const cart = await CartDB.findOne({ user_id });

  if (cart) {
    cart.products = cart.products.filter((item) => !productUniqueIdsToRemove.has(item.product_unique_id));

    await cart.save();
  }
};

/*
  Example JSON
  {
  "user_id": "67531b...", 
  "order_type": "Online", 
  "order_id": "OD_1736666666666_...", 
  "payment_method": "UPI", 
  "payment_status": "Paid", 
  "transaction_id": "TXN123456789", 
  "shipping_charges": 50, 
  "is_from_cart": true,

  "order_products": [
    {
      "product_unique_id": "PROD_001", 
      "product_name": "Premium T-Shirt",
      "quantity": 2,
      "unit_base_price": 500, 
      "unit_discount_price": 50, 
      "unit_tax_value": 0, 
      "unit_final_price": 450, 
      "additional_discount_percentage": 0,
      "additional_discount_amount": 0,
      "additional_discount_type": "percentage", 
      "gst": 0, 
    }
  ],

  "address": {
    "first_name": "John",
    "last_name": "Doe",
    "mobile_number": "9876543210",
    "house_number": "123",
    "street": "Main Street",
    "landmark": "Near Park",
    "city": "Mumbai",
    "district": "Mumbai Suburban",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
    "address_type": "Home",
    "save_addres": true 
  }

  "additional_discount_percentage": 10, 
  "additional_discount_amount": 100,
  "additional_discount_type": "percentage"
}
*/
export const createOrderServices = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const {
    orderModelDB: OrderModelDB,
    userModelDB,
    productModelDB: ProductModelDB,
    paymentTransactionsModelDB,
  } = await getTenantModels(tenantId);

  let userDoc = null;
  let username = null;

  if (payload.user_id) {
    userDoc = await userModelDB.findOne({ user_id: payload.user_id });
    throwIfTrue(!userDoc, `User not found with id: ${payload.user_id}`);
    username = userDoc.username;
  } else {
    username = payload.customer_name;
  }

  // Calculate Order Totals from Products
  const { order_products = [] } = payload;

  // Step 1: Calculate total values for EACH product
  // For each product, multiply unit values by quantity
  const productsWithTotals = await Promise.all(
    order_products.map(async (item) => {
      let quantity = Number(item.quantity);
      let unit_base_price = Number(item.unit_base_price); // Tax-inclusive MRP
      let unit_discount_price = Number(item.unit_discount_price || 0); // Discount amount
      let unit_discounted_price = Number(item.unit_discounted_price || 0); // Price after product discount
      let unit_gross_price = Number(item.unit_gross_price || 0); // Price after product discount
      let unit_tax_percentage = Number(item.unit_tax_percentage) || 0;
      let unit_tax_value = Number(item.unit_tax_value || 0); // Tax extracted from discounted price
      let unit_final_price = Number(item.unit_final_price); // Final price per unit (tax-inclusive)

      // Additional order-level discount fields
      let additional_discount_percentage = Number(item.additional_discount_percentage || 0);
      let additional_discount_amount = Number(item.additional_discount_amount || 0);
      let additional_discount_type = item.additional_discount_type || null;

      // Apply additional discount if provided
      if (additional_discount_type === "percentage" && additional_discount_percentage > 0) {
        // Calculate additional discount amount on the already-discounted price
        additional_discount_amount = Math.ceil((unit_discounted_price * additional_discount_percentage) / 100);

        // Apply additional discount
        const price_after_additional_discount = unit_discounted_price - additional_discount_amount;

        // Use reverse GST to extract tax from the final discounted price
        const taxableValue = price_after_additional_discount / (1 + unit_tax_percentage / 100);
        unit_tax_value = Math.ceil(price_after_additional_discount - taxableValue);

        // Final price is the price after all discounts (still tax-inclusive)
        unit_final_price = Math.ceil(price_after_additional_discount);
      } else if (additional_discount_type === "amount" && additional_discount_amount > 0) {
        // Apply additional discount amount
        const price_after_additional_discount = unit_discounted_price - additional_discount_amount;

        // Use reverse GST to extract tax from the final discounted price
        const taxableValue = price_after_additional_discount / (1 + unit_tax_percentage / 100);
        unit_tax_value = Math.ceil(price_after_additional_discount - taxableValue);

        // Final price is the price after all discounts (still tax-inclusive)
        unit_final_price = Math.ceil(price_after_additional_discount);
      }

      // Check if product exists
      const existingProduct = await ProductModelDB.findOne({ product_unique_id: item.product_unique_id });
      throwIfTrue(!existingProduct, `Product not found with id: ${item.product_unique_id}`);

      // Check if order quantity exceeds available stock
      throwIfTrue(
        existingProduct.stock_quantity < quantity,
        `Insufficient stock for product "${existingProduct.product_name}"`,
      );

      // Check if order quantity exceeds max_order_limit
      if (existingProduct.max_order_limit) {
        throwIfTrue(
          quantity > existingProduct.max_order_limit,
          `Order quantity exceeds maximum limit for product "${existingProduct.product_name}". Maximum allowed: ${existingProduct.max_order_limit}, Requested: ${quantity}`,
        );
      }

      return {
        product_unique_id: item.product_unique_id,
        product_name: existingProduct.product_name,

        quantity,
        unit_base_price,
        unit_discount_price,
        unit_discounted_price,
        unit_tax_percentage,
        unit_tax_value,
        unit_final_price,
        unit_gross_price,

        // Additional discount details if provided
        additional_discount_percentage,
        additional_discount_amount,
        additional_discount_type,

        // Calculate totals by multiplying unit values by quantity
        total_base_price: Math.ceil(unit_base_price * quantity),
        total_gross_price: Math.ceil(unit_gross_price * quantity),
        total_discount_price: Math.ceil(unit_discount_price * quantity),
        total_tax_value: Math.ceil(unit_tax_value * quantity),
        total_final_price: Math.ceil(unit_final_price * quantity), // Total price (tax-inclusive)
      };
    }),
  );

  // Step 2: Calculate ORDER-LEVEL totals by summing from all products
  // These represent the aggregate values across all products in the order
  let base_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_base_price, 0));

  let gross_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_gross_price, 0));

  let discount_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_discount_price, 0));

  let tax_value = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_tax_value, 0)); // Tax on discounted amounts

  let shipping_charges = Math.ceil(Number(payload.shipping_charges ?? 0));

  let additional_discount_percentage = Number(payload.additional_discount_percentage ?? 0);
  let additional_discount_amount = Math.ceil(Number(payload.additional_discount_amount ?? 0));
  let additional_discount_type = payload.additional_discount_type ?? null;
  // Total amount = Σ(final_price of all products) + shipping
  // where each product's final_price = (base - discount) + tax
  let total_amount = Math.ceil(
    productsWithTotals.reduce((sum, item) => sum + item.total_final_price, 0) + shipping_charges,
  );

  // Check for additional order level discounts
  if (additional_discount_type === "percentage") {
    additional_discount_amount = Math.ceil((total_amount * additional_discount_percentage) / 100);
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  } else if (additional_discount_type === "amount") {
    additional_discount_amount = Math.ceil(additional_discount_amount);
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  } else if (additional_discount_type === "coupon") {
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  }

  let order_create_date = payload.order_create_date ? new Date(payload.order_create_date) : new Date();

  let order_cancel_date = payload.order_cancel_date ? new Date(payload.order_cancel_date) : undefined;

  let order_id = `OD_${Date.now()}_${uuidv4().slice(-6)}`;

  const existingUser = await userModelDB.findOne({ user_id: payload.user_id });
  throwIfTrue(!existingUser, `User not found`);

  // Remove unwanted fields from payload
  const {
    is_from_cart,
    order_products: _removed,
    payment_status,
    payment_method,
    transaction_id,
    gateway,
    gateway_code,
    ...rest
  } = payload;

  // Construct final orderDoc
  const orderDoc = {
    ...rest,
    order_products: productsWithTotals, // Use calculated products with totals
    order_cancel_date,
    order_create_date,
    base_price,
    gross_price,
    tax_value,
    discount_price,
    shipping_charges,
    total_amount,
    additional_discount_amount,
    additional_discount_percentage,
    additional_discount_type,
    order_id,
    order_status_history: [
      {
        status: "Pending",
        updated_at: new Date(),
        updated_by: payload.user_id || "system",
        updated_name: username || "System",
        note: "Order created",
      },
    ],
  };
  console.log("orderDoc=====>", orderDoc);

  // const existingOrderWithTransaction = await PaymentTransactionsDB.findOne({
  //   order_id,
  //   transaction_id: payload?.transaction_id,
  // });
  // throwIfTrue(existingOrderWithTransaction, "Order already exists with this transaction id");

  // Remove save_addres inside address BEFORE validation
  if (orderDoc?.address?.save_addres) {
    const { save_addres, ...cleanAddress } = orderDoc.address;
    orderDoc.address = cleanAddress;
  }

  // Verify order products exist
  await verifyOrderProducts(tenantId, order_products);

  // Schema validation
  const { isValid, message } = validateOrderCreate(orderDoc);
  throwIfTrue(!isValid, message);

  // Save address ONLY if requested
  if (payload?.address?.save_addres && userDoc) {
    const { save_addres, ...addressToSave } = payload.address;

    await userModelDB.findByIdAndUpdate(payload.user_id, { $push: { address: addressToSave } }, { new: true });
  }

  console.log("✅✅ order Doc is ", orderDoc);
  // Create order
  const order = await OrderModelDB.create(orderDoc);

  const transactionReferenceId = `TXN_${order?.order_id}`;

  const paymentTransactionDoc = {
    order_id: order?.order_id,
    transaction_reference_id: transactionReferenceId,
    user_id: order?.user_id,
    amount: order?.total_amount,
  };

  const paymentTransaction = await paymentTransactionsModelDB.create(paymentTransactionDoc);

  return {
    ...order,
    transaction_reference_id: paymentTransaction?.transaction_reference_id,
  };
};

// Get all orders for a user
export const getAllUserOrdersServices = async (tenantId, userID) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  // const Order = await OrdersModel(tenantId);
  const { orderModelDB: Order } = await getTenantModels(tenantId);

  return await Order.find({ user_id: userID });
};

// Search orders
export const getAllOrdersService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let {
    searchTerm,
    user_id,
    from,
    to,
    payment_status,
    order_type,
    cash_on_delivery,
    payment_method,
    order_status,
    page = 1,
    limit = 10,
    sort,
    origin = "admin",
  } = filters;

  // console.log("✅✅ user_id is ", user_id);

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const skip = (page - 1) * limit;

  const query = {};

  // if (order_status) query.order_status = order_status;
  if (from && to) {
    query.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  if (user_id) query.user_id = user_id;
  if (order_type) query.order_type = order_type;
  if (payment_method) query.payment_method = payment_method;
  if (cash_on_delivery) query.cash_on_delivery = cash_on_delivery;
  if (searchTerm)
    query.$or = [
      { customer_name: { $regex: searchTerm, $options: "i" } },
      { mobile_number: { $regex: searchTerm, $options: "i" } },
      { order_id: { $regex: searchTerm, $options: "i" } },
      { "order_products.product_name": { $regex: searchTerm, $options: "i" } },
      { "order_products.product_unique_id": { $regex: searchTerm, $options: "i" } },
    ];

  if (origin === "user")
    query.payment_status = {
      $in: ["Successful", "Refunded"],
    };

  const sortObj = buildSortObject(sort);

  // const OrderModelDB = await OrdersModel(tenantId);
  const { orderModelDB: OrderModelDB } = await getTenantModels(tenantId);

  /* -------------------------------------------------------------
     🔥 OPTIMIZED QUERY with $facet (Single DB Call)
  -------------------------------------------------------------- */

  // Separate payment-related filters
  const paymentQuery = {};
  if (payment_status) paymentQuery["payment_details.payment_status"] = payment_status;
  if (payment_method) paymentQuery["payment_details.payment_method"] = payment_method;
  // if (transaction_id) paymentQuery["payment_details.transaction_id"] = transaction_id;
  console.log("query is ", query);
  const pipeline = [
    { $match: query },
    {
      $addFields: {
        order_status: { $arrayElemAt: ["$order_status_history.status", -1] },
      },
    },
    // Filter by order_status if provided
    ...(order_status ? [{ $match: { order_status: order_status } }] : []),
    {
      $lookup: {
        from: "paymenttransactions",
        localField: "payment_transactions",
        foreignField: "_id",
        as: "payment_details",
      },
    },
    // Extract first payment transaction and merge fields to root
    {
      $addFields: {
        payment_info_temp: { $arrayElemAt: ["$payment_details", 0] },
      },
    },
    {
      $addFields: {
        payment_status: "$payment_info_temp.payment_status",
        payment_method: "$payment_info_temp.payment_method",
        transaction_id: "$payment_info_temp.transaction_id",
        gateway: "$payment_info_temp.gateway",
        gateway_code: "$payment_info_temp.gateway_code",
        currency: "$payment_info_temp.currency",
      },
    },
    {
      $project: {
        payment_info_temp: 0, // Remove temp field
      },
    },
    // Filter by payment details if provided
    ...(Object.keys(paymentQuery).length > 0 ? [{ $match: paymentQuery }] : []),
    { $sort: Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];
  console.log("pipeline is===>", pipeline);
  const result = await OrderModelDB.aggregate(pipeline);
  const orders = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: orders,
  };
};

export const updateOrderService = async (tenantId, orderID, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderID, "Valid Order ID is required");
  throwIfTrue(!updateData || Object.keys(updateData).length === 0, "Update data is required");

  // const Order = await OrdersModel(tenantId);
  // const Product = await ProductModel(tenantId);
  const { orderModelDB: Order, productModelDB: Product, userModelDB } = await getTenantModels(tenantId);
  const order = await Order.findById(orderID);
  throwIfTrue(!order, "Order not found");

  // Prevent updates on fully Delivered, Cancelled, or Returned orders
  const allDelivered = order.order_Products?.every((p) => p.status === "Delivered");
  const allCancelled = order.order_Products?.every((p) => p.status === "Cancelled");
  const allReturned = order.order_Products?.every((p) => p.status === "Returned");

  throwIfTrue(
    allDelivered || allCancelled || allReturned,
    "Cannot update order that is fully Delivered, Cancelled, or Returned",
  );

  let stockRestored = false;
  let wasJustCancelled = false;

  // Handle Address Update
  if (updateData?.address) {
    const hasShipped = order.order_Products?.some((p) => ["Shipped", "Delivered"].includes(p.status));
    throwIfTrue(hasShipped, "Cannot change address after any item is shipped");
    order.address = updateData?.address;
  }

  // Handle Offline Address Update (for Offline orders)
  if (Object.prototype.hasOwnProperty.call(updateData, "offline_address")) {
    const hasShipped = order.order_Products?.some((p) => ["Shipped", "Delivered"].includes(p.status));
    throwIfTrue(hasShipped, "Cannot change offline address after any item is shipped");
    order.offline_address = updateData?.offline_address;
  }

  // Handle Order Status Update via order_status_history
  if (updateData?.order_status) {
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];
    throwIfTrue(!validStatuses.includes(updateData.order_status), `Invalid order status: ${updateData.order_status}`);

    order.order_status_history.push({
      status: updateData.order_status,
      updated_at: new Date(),
      updated_by: updateData.updated_by || "system",
      note: updateData.status_note || `Status changed to ${updateData.order_status}`,
    });
  }

  // Handle Customer Details Update (for Offline orders)
  if (updateData?.customer_name) {
    order.customer_name = updateData.customer_name;
  }

  if (updateData?.mobile_number) {
    order.mobile_number = updateData.mobile_number;
  }

  // Handle Shipping and Currency Updates
  if (updateData?.shipping_charges !== undefined) {
    order.shipping_charges = Number(updateData.shipping_charges);
  }

  if (updateData?.currency) {
    order.currency = updateData.currency;
  }

  // Handle Individual Product Status Updates
  if (updateData?.order_Products && Array.isArray(updateData?.order_Products)) {
    for (const updateProd of updateData?.order_Products) {
      const item = order.order_Products?.find((p) => p.product_unique_id === updateProd.product_unique_id);
      throwIfTrue(!item, `Product ${updateProd.product_unique_id} not found in order`);

      if (updateProd.status && updateProd.status !== item.status) {
        const oldStatus = item.status;
        item.status = updateProd.status;

        if (updateProd.status === "Delivered") {
          item.delivered_at = new Date();
        }
        if (updateProd.status === "Cancelled") {
          item.cancelled_at = new Date();
        }
        if (updateProd.status === "Returned") {
          item.returned_at = new Date();
        }

        // Optional: Notify on status change
        if (["Shipped", "Delivered", "Returned", "Cancelled"].includes(updateProd.status)) {
          sendUserNotification(tenantId, order.user_id, {
            title: `Item ${updateProd.status}`,
            message: `${item.product_name} is now ${updateProd.status}`,
            type: "order_update",
            relatedId: order._id,
            link: `/orders/${order._id}`,
            data: { productName: item.product_name, newStatus: updateProd.status },
          }).catch((err) => console.error("Background Status Update Notification error:", err.message));
        }
      }
    }
  }

  // Handle Payment Status Updates via PaymentTransactions
  if (updateData?.payment_status && updateData?.payment_status?.toLowerCase() === "paid") {
    const { paymentTransactionsModelDB } = await getTenantModels(tenantId);

    // If transaction_id is present, it means we are adding a NEW transaction (e.g. initial payment after order creation)
    if (updateData?.transaction_id) {
      // Push to order's payment_transactions array
      order.transaction_id = updateData.transaction_id;

      // Add to order status history
      order.order_status_history.push({
        status: "Pending",
        updated_at: new Date(),
        updated_by: updateData.updated_by || "system",
        note: "Payment successful, order confirmed",
      });

      // Also update the order's payment status for quick access if needed, though we rely on transactions mostly
      order.payment_status = "Successful";
    } else {
      // Existing logic: Find the latest transaction and update it
      // Simplified: Find the last linked transaction
      let lastTransId = order.payment_transactions[order.payment_transactions.length - 1];

      if (lastTransId) {
        await paymentTransactionsModelDB.findByIdAndUpdate(lastTransId, {
          payment_status: updateData?.payment_status,
        });
      }
    }

    // Update stock
    await updateStockOnOrder(tenantId, order.order_products);

    // Clear cart after order
    if (order.is_from_cart && order.user_id) {
      await clearProductsFromCartAfterOrder(tenantId, order.user_id, order.order_products);
    }

    let userDoc = null;

    let username = null;

    if (order?.user_id) {
      userDoc = await userModelDB.findOne({ user_id: order?.user_id });
      throwIfTrue(!userDoc, `User not found with id: ${order?.user_id}`);
      username = userDoc?.username;
    } else {
      username = order?.customer_name;
    }

    // Notify user
    if (order.user_id) {
      sendUserNotification(tenantId, order.user_id, {
        title: "Order Placed Successfully",
        message: `Your order ${order.order_id} has been placed successfully!`,
        type: "order",
        relatedId: order.order_id,
        relatedModel: "Order",
        link: `/order-products-detailes/${order.order_id}`,
        data: {
          orderId: order.order_id,
          total: order.total_amount,
        },
      }).catch((err) => console.error("Background User Notification error:", err.message));
    }

    // Notify admin
    if (order.order_type === "Online") {
      sendAdminNotification(tenantId, ADMIN_ID, {
        title: "New Order Received",
        message: `New order from user ${username}. Total: ₹${order.total_amount}`,
        type: "order",
        relatedId: order.order_id,
        relatedModel: "Order",
        senderModel: "user",
        sender: username,
        link: `/order-products-detailes/${order.order_id}`,
        data: {
          orderId: order.order_id,
          userId: order.user_id,
          amount: order.total_amount,
        },
      }).catch((err) => console.error("Background Admin Notification error:", err.message));
    }

    // If we need to clone the logic for "Refunded" -> "Cancelled"
    if (updateData?.payment_status === "Refunded") {
      // We don't set order.payment_status as it is gone.
      // We depend on the transaction.
      // However, we still need to trigger the cancellation logic
    }
  }

  if (updateData?.payment_status && updateData?.payment_status?.toLowerCase() === "failed") {
    const { paymentTransactionsModelDB } = await getTenantModels(tenantId);
    if (updateData?.transaction_id) {
      // Push to order's payment_transactions array
      order.transaction_id = updateData?.transaction_id;

      // Add to order status history
      order.order_status_history.push({
        status: "Cancelled",
        updated_at: new Date(),
        updated_by: updateData.updated_by || "system",
        note: "Payment failed",
      });

      // Also update the order's payment status for quick access if needed, though we rely on transactions mostly
      order.payment_status = "Failed";
    }
  }

  // Handle Full Order Cancellation
  if (updateData?.payment_status === "Refunded" || updateData?.isCancelled === true) {
    wasJustCancelled = true;
    // order.payment_status = "Refunded"; // REMOVED
    order.order_cancel_date = new Date();

    // Add to order status history
    order.order_status_history.push({
      status: "Cancelled",
      updated_at: new Date(),
      updated_by: updateData.updated_by || "system",
      note: updateData.cancellation_reason || "Order cancelled",
    });

    order.order_Products.forEach((p) => {
      if (!["Delivered", "Returned"].includes(p.status)) {
        p.status = "Cancelled";
        p.cancelled_at = new Date();
      }
    });
    stockRestored = true;
  }

  const updatedOrder = await order.save();

  // Restore Stock on Cancellation
  if (stockRestored) {
    const bulkOps = updatedOrder.order_Products
      ?.filter((item) => item.status === "Cancelled")
      ?.map((item) => ({
        updateOne: {
          filter: { product_unique_id: item.product_unique_id },
          update: { $inc: { stock_quantity: +item.quantity } },
        },
      }));

    if (bulkOps?.length > 0) {
      await Product.bulkWrite(bulkOps);
    }
  }

  // NOTIFICATIONS

  // 1. Full Order Cancelled
  if (wasJustCancelled) {
    sendUserNotification(tenantId, updatedOrder.user_id, {
      title: "Order Cancelled",
      message: `Your order has been cancelled. Refund will be processed within 5-7 days.`,
      type: "order_cancelled",
      relatedId: updatedOrder._id,
      relatedModel: "Order",
      link: `/orders/${updatedOrder._id}`,
      data: {
        orderId: updatedOrder._id,
        total: updatedOrder.total_amount,
        reason: updateData?.cancellation_reason || "Requested by user",
      },
    }).catch((err) => console.error("Background Cancel User Notification error:", err.message));

    sendAdminNotification(tenantId, {
      title: "Order Cancelled",
      message: `Order cancelled by user/admin. Amount: ₹${updatedOrder.total_amount}`,
      type: "order_cancelled",
      relatedId: updatedOrder._id,
      link: `/admin/orders/${updatedOrder._id}`,
    }).catch((err) => console.error("Background Cancel Admin Notification error:", err.message));
  }

  // 2. Any Item Marked as Returned
  const returnedItems = updatedOrder.order_Products?.filter((p) => p.status === "Returned");
  if (returnedItems?.length > 0) {
    const itemsList = returnedItems.map((i) => `${i.product_name} (x${i.quantity})`).join(", ");

    sendUserNotification(tenantId, updatedOrder.user_id, {
      title: "Item(s) Returned",
      message: `Returned items: ${itemsList}. Refund will be initiated soon.`,
      type: "order_returned",
      relatedId: updatedOrder._id,
      link: `/orders/${updatedOrder._id}`,
      data: { returnedItems: itemsList },
    }).catch((err) => console.error("Background Return User Notification error:", err.message));

    sendAdminNotification(tenantId, {
      title: "Items Returned",
      message: `User returned items in order #${updatedOrder._id}: ${itemsList}`,
      type: "order_returned",
      relatedId: updatedOrder._id,
    }).catch((err) => console.error("Background Return Admin Notification error:", err.message));
  }

  return updatedOrder;
};

export const getOrderProductService = async (tenantId, orderId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderId, "Valid Order ID is required");

  const { orderModelDB, productModelDB, paymentTransactionsModelDB } = await getTenantModels(tenantId);

  // 1. Get order without populate
  const orderDoc = await orderModelDB.findOne({ order_id: orderId }).lean();
  if (!orderDoc) throw new Error("Order not found");

  // 2. Get manual transactions
  const transaction = await paymentTransactionsModelDB.findOne({ order_id: orderId }).lean();

  console.log("Transaction", transaction);

  // 3. Get matching products
  const ids = orderDoc.order_products.map((p) => p.product_unique_id);
  const products = await productModelDB.find({ product_unique_id: { $in: ids } }).lean();

  // 4. Attach product object
  const mergedProducts = orderDoc.order_products.map((item) => ({
    ...item,
    product_details: products.find((prod) => prod.product_unique_id === item.product_unique_id) || null,
  }));

  // 5. Flatten payment details from the first transaction
  const { _id, createdAt, updatedAt, ...paymentFields } = transaction;

  return {
    ...orderDoc,
    ...paymentFields, // Merge payment fields to root
    order_products: mergedProducts,
  };
};

export const getOrderSingleProductService = async (tenantId, order_id, product_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!order_id, "Valid Order ID is required");

  // const Order = await OrdersModel(tenantId);
  const { orderModelDB: Order } = await getTenantModels(tenantId);

  const orderDoc = await Order.findOne({ order_id });
  if (!orderDoc) throw new Error("Order not found");

  const order = orderDoc.toObject();

  const matchedProduct = order.order_products.find((p) => p.product_unique_id === product_unique_id);

  if (!matchedProduct) throw new Error("Product not found in this order");

  // Remove the full array and add single product field
  delete order.order_products;
  order.product = matchedProduct;

  return order;
};

export const updateOrderStatusService = async (tenantId, orderId, newStatus, updatedBy, note) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderId, "Valid Order ID is required");
  throwIfTrue(!newStatus, "Status is required");

  const { orderModelDB, userModelDB } = await getTenantModels(tenantId);

  const order = await orderModelDB.findOne({ order_id: orderId });
  throwIfTrue(!order, "Order not found");
  const existingUser = await userModelDB.findOne({ user_id: updatedBy });
  throwIfTrue(!existingUser, `User not found`);
  // console.log("existingUser=====>", existingUser);

  // Check if the new status already exists in the history
  const statusExists = order.order_status_history.some((entry) => entry.status === newStatus);

  throwIfTrue(statusExists, `Order is already in ${newStatus} status`);

  // Push new status to history
  order.order_status_history.push({
    status: newStatus,
    updated_at: new Date(),
    updated_by: existingUser.user_id,
    updated_name: existingUser.username,
    note: note || `Status changed to ${newStatus}`,
  });
  // console.log("order data=====>", order);
  // Save the updated order
  return await order.save();
};
