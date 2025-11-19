import ProductModel from "../Products/productModel.js";
import { sendAdminNotification, sendUserNotification } from "../utils/notificationHelper.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import OrdersModel from "./orderModel.js";

//   Decrease product stock (called after order is saved)
const updateStockOnOrder = async (tenantID, products) => {
  const Product = await ProductModel(tenantID);

  const bulkOps = products.map((item) => ({
    updateOne: {
      filter: { product_unique_id: item.product_unique_id },
      update: { $inc: { stock_quantity: -item.quantity } },
    },
  }));
  console.log(bulkOps,'bulkOps');
  console.log(Product,'Product');
  

  if (bulkOps.length) await Product.bulkWrite(bulkOps);
};

//  Create / update a **single** order (one payment, many items)
export const createOrderServices = async (tenantID, payload) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const Order = await OrdersModel(tenantID);

  throwIfTrue(!payload.user_id, "user_id is required");
  throwIfTrue(!payload.payment_method, "payment_method is required");
  throwIfTrue(!payload.address || typeof payload.address !== "object", "address is required and must be an object");

  throwIfTrue(!Array.isArray(payload.orders) || payload.orders.length === 0, "At least one product is required");

  // Build product items
  const newProducts = payload.orders.map((p, idx) => {
    throwIfTrue(
      !p.product_unique_id || !p.product_name || !p.quantity || !p.price || !p.total_price,
      `Product at index ${idx}: missing required fields`
    );

    return {
      product_unique_id: String(p.product_unique_id),
      product_name: String(p.product_name),
      quantity: Math.max(1, Number(p.quantity) || 0),
      price: Number(p.price),
      discount_price: Number(p.discount_price ?? 0),
      total_price: Number(p.total_price),
      tax_amount: Number(p.tax_amount ?? 0),
      status: p.status ?? "Pending",
    };
  });

  // Compute totals
  const subtotal = newProducts.reduce((sum, item) => sum + item.total_price, 0);
  const tax_amount = Number(payload.tax_amount ?? 0);
  const shipping_charges = Number(payload.shipping_charges ?? 0);
  const total_amount = subtotal + tax_amount + shipping_charges;

  const orderDoc = {
    user_id: payload.user_id,
    order_Products: newProducts,
    address: payload.address,

    payment_status: payload.payment_status ?? "Pending",
    payment_method: payload.payment_method,
    transaction_id: payload.transaction_id ?? null,
    order_create_date: payload.order_create_date ? new Date(payload.order_create_date) : new Date(),
    order_cancel_date: payload.order_cancel_date ? new Date(payload.order_cancel_date) : null,

    subtotal,
    shipping_charges,
    total_amount,
    currency: payload.currency ?? "INR",
  };

  const order = new (await Order)();
  Object.assign(order, orderDoc);

  const savedOrder = await order.save();

  // Update product stock
  await updateStockOnOrder(tenantID, savedOrder.order_Products);

  // User Notification
  await sendUserNotification(tenantID, payload.user_id, {
    title: "Order Placed Successfully",
    message: `Your order  has been placed successfully!`,
    type: "order",
    relatedId: savedOrder._id,
    relatedModel: "Order",
    link: `/orders/${savedOrder._id}`,
    data: {
      orderId: savedOrder._id,
      total: savedOrder.total_amount,
    },
  });

  // Admin Notification
  await sendAdminNotification(tenantID, {
    title: "New Order Received",
    message: `New order from user ${payload.user_id}. Total: ₹${savedOrder.total_amount}`,
    type: "order",
    relatedId: savedOrder._id,
    relatedModel: "Order",
    link: `/admin/orders/${savedOrder._id}`,
    data: {
      orderId: savedOrder._id,
      userId: payload.user_id,
      amount: savedOrder.total_amount,
    },
  });
  return savedOrder;
};

// Get all orders for a user
export const getAllUserOrdersServices = async (tenantID, userID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  const Order = await OrdersModel(tenantID);
  console.log(Order.find({ user_id: userID }), " Order.find({ user_id: userID });");

  return await Order.find({ user_id: userID });
};

// Search orders
export const orderSearchServices = async (tenantID, { q } = {}) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const Order = await OrdersModel(tenantID);

  if (!q?.trim()) {
    return Order.aggregate([{ $sort: { createdAt: -1 } }]);
  }

  const regex = { $regex: q.trim(), $options: "i" };

  const pipeline = [
    {
      $match: {
        $or: [
          { user_id: regex },
          { transaction_id: regex },
          { "order_Products.product_name": regex },
          { "order_Products.product_unique_id": regex },
          { "order_Products.status": regex },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  return Order.aggregate(pipeline);
};

export const updateOrderService = async (tenantID, orderID, updateData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!orderID, "Valid Order ID is required");
  throwIfTrue(!updateData || Object.keys(updateData).length === 0, "Update data is required");

  const Order = await OrdersModel(tenantID);
  const Product = await ProductModel(tenantID);

  const order = await Order.findById(orderID);
  throwIfTrue(!order, "Order not found");

  // Prevent updates on fully Delivered, Cancelled, or Returned orders
  const allDelivered = order.order_Products.every((p) => p.status === "Delivered");
  const allCancelled = order.order_Products.every((p) => p.status === "Cancelled");
  const allReturned = order.order_Products.every((p) => p.status === "Returned");

  throwIfTrue(
    allDelivered || allCancelled || allReturned,
    "Cannot update order that is fully Delivered, Cancelled, or Returned"
  );

  let stockRestored = false;
  let wasJustCancelled = false;

  // Handle Address Update
  if (updateData.address) {
    const hasShipped = order.order_Products.some((p) => ["Shipped", "Delivered"].includes(p.status));
    throwIfTrue(hasShipped, "Cannot change address after any item is shipped");
    order.address = updateData.address;
  }

  // Handle Individual Product Status Updates
  if (updateData.order_Products && Array.isArray(updateData.order_Products)) {
    for (const updateProd of updateData.order_Products) {
      const item = order.order_Products.find((p) => p.product_unique_id === updateProd.product_unique_id);
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
          await sendUserNotification(tenantID, order.user_id, {
            title: `Item ${updateProd.status}`,
            message: `${item.product_name} is now ${updateProd.status}`,
            type: "order_update",
            relatedId: order._id,
            link: `/orders/${order._id}`,
            data: { productName: item.product_name, newStatus: updateProd.status },
          });
        }
      }
    }
  }

  // Handle Full Order Cancellation
  if (updateData.payment_status === "Refunded" || updateData.isCancelled === true) {
    wasJustCancelled = true;
    order.payment_status = "Refunded";
    order.order_cancel_date = new Date();

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
      .filter((item) => item.status === "Cancelled")
      .map((item) => ({
        updateOne: {
          filter: { product_unique_id: item.product_unique_id },
          update: { $inc: { stock_quantity: +item.quantity } },
        },
      }));

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }
  }

  // NOTIFICATIONS

  // 1. Full Order Cancelled
  if (wasJustCancelled) {
    await sendUserNotification(tenantID, updatedOrder.user_id, {
      title: "Order Cancelled",
      message: `Your order has been cancelled. Refund will be processed within 5-7 days.`,
      type: "order_cancelled",
      relatedId: updatedOrder._id,
      relatedModel: "Order",
      link: `/orders/${updatedOrder._id}`,
      data: {
        orderId: updatedOrder._id,
        total: updatedOrder.total_amount,
        reason: updateData.cancellation_reason || "Requested by user",
      },
    });

    await sendAdminNotification(tenantID, {
      title: "Order Cancelled",
      message: `Order cancelled by user/admin. Amount: ₹${updatedOrder.total_amount}`,
      type: "order_cancelled",
      relatedId: updatedOrder._id,
      link: `/admin/orders/${updatedOrder._id}`,
    });
  }

  // 2. Any Item Marked as Returned
  const returnedItems = updatedOrder.order_Products.filter((p) => p.status === "Returned");
  if (returnedItems.length > 0) {
    const itemsList = returnedItems.map((i) => `${i.product_name} (x${i.quantity})`).join(", ");

    await sendUserNotification(tenantID, updatedOrder.user_id, {
      title: "Item(s) Returned",
      message: `Returned items: ${itemsList}. Refund will be initiated soon.`,
      type: "order_returned",
      relatedId: updatedOrder._id,
      link: `/orders/${updatedOrder._id}`,
      data: { returnedItems: itemsList },
    });

    await sendAdminNotification(tenantID, {
      title: "Items Returned",
      message: `User returned items in order #${updatedOrder._id}: ${itemsList}`,
      type: "order_returned",
      relatedId: updatedOrder._id,
    });
  }

  return updatedOrder;
};
