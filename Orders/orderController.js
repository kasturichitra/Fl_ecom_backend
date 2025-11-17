import { createOrderServices, getAllUserOrdersServices, orderSearchService, updateOrderService } from "./orderService.js";
export const createOrderController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const {
      user_ID,
      orders,
      address,
      tax_amount,
      shipping_charges,
      currency,
      payment_method,
      payment_status,
      transaction_id,
      order_create_date,
      order_cancel_date,
    } = req.body;

    // Early validation
    if (!user_ID || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "user_ID and at least one product are required",
      });
    }

    const payload = {
      user_ID,
      orders,
      address,
      tax_amount,
      shipping_charges,
      currency,
      payment_method,
      payment_status,
      transaction_id,
      order_create_date,
      order_cancel_date,
    };

    const savedOrder = await createOrderServices(tenantID, payload);

    return res.status(201).json({
      status: "Success",
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (err) {
    console.error("Order creation failed:", err);

    return res.status(500).json({
      status: "Failed",
      message: err.message || "Internal server error",
    });
  }
};


// get all user orders
export const getAllUserOrdersController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const userID = req.params.id;

    const orders = await getAllUserOrdersServices(tenantID, userID);

    res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Order search failed ===>", error.message);
    res.status(500).json({
      status: "failed",
      message: "Order search error",
      error: error.message,
    });
  }
};



export const getOrderSearchController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) {
      return res.status(400).json({
        status: "failed",
        message: "Header 'x-tenant-id' is required",
      });
    }

    const { q } = req.query;

    const orders = await orderSearchService(tenantID, { q });

    return res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Global order search failed:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Search error",
      error: error.message,
    });
  }
};



export const updateOrderController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid Order ID",
      });
    }

    const updateData = req.body;

    const updatedOrder = await updateOrderService(tenantID, id, updateData);

    return res.status(200).json({
      status: "success",
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Order update error:", error.message);

    const statusCode = error.message.includes("not found") || error.message.includes("Invalid") ? 404 : 400;

    return res.status(statusCode).json({
      status: "failed",
      message: error.message || "Failed to update order",
    });
  }
};
