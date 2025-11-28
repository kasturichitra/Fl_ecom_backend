import ProductModel from "../Products/productModel.js";
import UserModel from "../Users/userModel.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { fcm } from "../utils/firebase-admin.js";
import generateNextOrderId from "../utils/generateOrderId.js";
import { getFcmToken } from "../utils/getFcmToken.js";
import { sendAdminNotification, sendUserNotification } from "../utils/notificationHelper.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import OrdersModel from "./orderModel.js";
import { validateOrderCreate } from "./validations/validateOrderCreate.js";

//   Decrease product stock (called after order is saved)
const updateStockOnOrder = async (tenantId, products) => {
  const Product = await ProductModel(tenantId);

  const bulkOps = products.map((item) => ({
    updateOne: {
      filter: { product_unique_id: item.product_unique_id },
      update: { $inc: { stock_quantity: -item.quantity } },
    },
  }));
  console.log(bulkOps, "bulkOps");
  console.log(Product, "Product");

  if (bulkOps.length) await Product.bulkWrite(bulkOps);
};

//  Create / update a **single** order (one payment, many items)
export const createOrderServices = async (tenantId, payload, adminId = "691ee270ca7678dfe3a884f7") => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const OrderModelDB = await OrdersModel(tenantId);
  const UserModelDB = await UserModel(tenantId);

  // Handle user not found validation
  let username = null;
  let userDoc = null;

  if (payload.user_id) {
    userDoc = await UserModelDB.findById(payload.user_id);
    throwIfTrue(!userDoc, `User not found with id: ${payload.user_id}`);
    username = userDoc.username;
  } else {
    username = payload.customer_name;
  }

  const { order_products = [] } = payload;
  const currectDate = new Date();

  const lastOrderId = await OrderModelDB.findOne({
    createdAt: {
      $gte: new Date(currectDate.setHours(0, 0, 0, 0)),
      $lt: new Date(currectDate.setHours(23, 59, 59, 999)),
    },
  }).sort({ createdAt: -1 });
  // Compute totals
  const subtotal = order_products.reduce((sum, item) => sum + item.total_price, 0);
  // const tax_amount = Number(payload.tax_amount ?? 0);
  const shipping_charges = Number(payload.shipping_charges ?? 0);
  const total_amount = subtotal + shipping_charges;

  const order_create_date = payload.order_create_date ? new Date(payload.order_create_date) : new Date();
  const order_cancel_date = payload.order_cancel_date ? new Date(payload.order_cancel_date) : undefined;
  const order_id = generateNextOrderId(lastOrderId?.order_id);

  // Design a ready to go order Doc to send to db
  const orderDoc = {
    ...payload,
    order_cancel_date,
    order_create_date,
    subtotal,
    shipping_charges,
    total_amount,
    // tax_amount,
    order_id,
  };

  // Remove save_addres from orderDoc to prevent validation error
  delete orderDoc.save_addres;

  // Do schema validation on order Doc
  const { isValid, message } = validateOrderCreate(orderDoc);
  throwIfTrue(!isValid, message);
  //save_addres means save the address in user collection
  if (payload.save_addres) {
    if (payload.save_addres && userDoc) {
      userDoc.address.push(payload.address);
      await userDoc.save();
    }
  }
  // console.log(orderDoc, "orderDoc");

  const order = await OrderModelDB.create(orderDoc);

  // Update product stock
  await updateStockOnOrder(tenantId, order.order_products);

  if (order.user_id) {
    // User Notification
    const Notification = await sendUserNotification(tenantId, order.user_id, {
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
    });

    // const token = await getFcmToken(tenantId, order.user_id || "69259c7026c2856821c44ced");

    // await fcm.send({
    //   token,
    //   notification: {
    //     title: Notification.title,
    //     body: Notification.message,
    //   },
    // });
  }

  // Admin Notification
  if (order.order_type === "Online") {
    const Notification = await sendAdminNotification(tenantId, adminId, {
      title: "New Order Received",
      message: `New order from user ${username}. Total: ₹${order.total_amount}`,
      type: "order",
      relatedId: order.order_id,
      relatedModel: "Order",
      senderModel: "User",
      sender: username,
      link: `/order-products-detailes/${order.order_id}`,
      data: {
        orderId: order.order_id,
        userId: order.user_id,
        amount: order.total_amount,
      },
    });

    // TODO: Edit here to send admin credentials to the fcm
    // const token = await getFcmToken(tenantId, order.user_id || "69259c7026c2856821c44ced");

    // await fcm.send({
    //   token,
    //   notification: {
    //     title: Notification.title,
    //     body: Notification.message,
    //   },
    // });
  }
  return order;
};

// Get all orders for a user
export const getAllUserOrdersServices = async (tenantId, userID) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const Order = await OrdersModel(tenantId);
  console.log(Order.find({ user_id: userID }), " Order.find({ user_id: userID });");

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
  } = filters;

  const skip = (page - 1) * limit;

  const query = {};

  if (order_status) query.order_status = order_status;
  if (from && to) {
    query.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }
  if (user_id) query.user_id = user_id;
  if (payment_status) query.payment_status = payment_status;
  if (order_type) query.order_type = order_type;
  if (payment_method) query.payment_method = payment_method;
  if (cash_on_delivery) query.cash_on_delivery = cash_on_delivery;
  if (searchTerm)
    query.$or = [
      { customer_name: { $regex: searchTerm, $options: "i" } },
      { mobile_number: { $regex: searchTerm, $options: "i" } },
      { "order_products.product_name": { $regex: searchTerm, $options: "i" } },
      { "order_products.product_unique_id": { $regex: searchTerm, $options: "i" } },
    ];

  const sortObj = buildSortObject(sort);

  const OrderModelDB = await OrdersModel(tenantId);

  const orders = await OrderModelDB.find(query).skip(skip).limit(limit).sort(sortObj);

  const totalCount = await OrderModelDB.countDocuments(query);

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

  const Order = await OrdersModel(tenantId);
  const Product = await ProductModel(tenantId);

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
          await sendUserNotification(tenantId, order.user_id, {
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
    await sendUserNotification(tenantId, updatedOrder.user_id, {
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

    await sendAdminNotification(tenantId, {
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

    await sendUserNotification(tenantId, updatedOrder.user_id, {
      title: "Item(s) Returned",
      message: `Returned items: ${itemsList}. Refund will be initiated soon.`,
      type: "order_returned",
      relatedId: updatedOrder._id,
      link: `/orders/${updatedOrder._id}`,
      data: { returnedItems: itemsList },
    });

    await sendAdminNotification(tenantId, {
      title: "Items Returned",
      message: `User returned items in order #${updatedOrder._id}: ${itemsList}`,
      type: "order_returned",
      relatedId: updatedOrder._id,
    });
  }

  return updatedOrder;
};

export const getOrderProductService = async (tenantId, orderId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderId, "Valid Order ID is required");

  const Order = await OrdersModel(tenantId);
  const Product = await ProductModel(tenantId);

  //  Get order
  const order = await Order.findOne({ order_id: orderId });
  if (!order) throw new Error("Order not found");

  //  Extract product_unique_ids from order
  const ids = order.order_products.map((p) => p.product_unique_id);

  //  Get matching products in one query
  const products = await Product.find({ product_unique_id: { $in: ids } });

  // 4. Attach product object
  const mergedProducts = order.order_products.map((item) => ({
    ...item.toObject(),
    product_details: products.find((prod) => prod.product_unique_id === item.product_unique_id) || null,
  }));

  return {
    ...order.toObject(),
    order_products: mergedProducts,
  };
};
