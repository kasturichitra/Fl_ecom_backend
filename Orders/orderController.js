import {
  createOrderServices,
  getAllUserOrdersServices,
  getAllOrdersService,
  updateOrderService,
} from "./orderService.js";

export const createOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const data = req.body;

    const order = await createOrderServices(tenantId, data);

    return res.status(201).json({
      status: "Success",
      message: "Order created successfully",
      data: order,
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
    const tenantId = req.headers["x-tenant-id"];
    const userID = req.params.id;

    const orders = await getAllUserOrdersServices(tenantId, userID);

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

export const getAllOrdersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const orders = await getAllOrdersService(tenantId, filters);

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
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid Order ID",
      });
    }

    const updateData = req.body;

    const updatedOrder = await updateOrderService(tenantId, id, updateData);

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
