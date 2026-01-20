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
    "Cannot update order that is fully Delivered, Cancelled, or Returned"
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
  if (updateData?.payment_status) {
    const { paymentTransactionsModelDB: PaymentTransactionsDB } = await getTenantModels(tenantId);

    // If transaction_id is present, it means we are adding a NEW transaction (e.g. initial payment after order creation)
    if (updateData?.transaction_id) {
      const paymentDoc = {
        order_id: order.order_id,
        user_id: order.user_id,
        payment_status: updateData?.payment_status || "Pending",
        payment_method: updateData?.payment_method || "Cash",
        transaction_id: updateData?.transaction_id,
        amount: order.total_amount, // Use order total amount
        currency: order.currency || "INR", // Default to INR if not in order
        gateway: updateData?.gateway,
        gateway_code: updateData?.gateway_code,
        key_id: updateData?.key_id,
      };

      const paymentTrans = await PaymentTransactionsDB.create(paymentDoc);

      // Push to order's payment_transactions array
      order.payment_transactions.push(paymentTrans._id);
      order.order_status = "Pending";

      // Also update the order's payment status for quick access if needed, though we rely on transactions mostly
      order.payment_status = updateData?.payment_status?.toLowerCase() === "paid" ? "Successful": null;
    } else {
      // Existing logic: Find the latest transaction and update it
      // Simplified: Find the last linked transaction
      let lastTransId = order.payment_transactions[order.payment_transactions.length - 1];

      if (lastTransId) {
        await PaymentTransactionsDB.findByIdAndUpdate(lastTransId, {
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
      userDoc = await userModelDB.findById(order?.user_id);
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

  // Handle Full Order Cancellation
  if (updateData?.payment_status === "Refunded" || updateData?.isCancelled === true) {
    wasJustCancelled = true;
    // order.payment_status = "Refunded"; // REMOVED
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
