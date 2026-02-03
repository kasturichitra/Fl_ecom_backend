import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createOrderServices,
  getAllUserOrdersServices,
  getAllOrdersService,
  updateOrderService,
  getOrderProductService,
  getOrderSingleProductService,
  updateOrderStatusService,
  createOfflineOrderService,
} from "./orderService.js";

export const createOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const data = req.body;

    const order = await createOrderServices(tenantId, data);

    res.status(201).json(successResponse("Order created successfully", { data: order }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

export const createOfflineOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const data = req.body;

    const order = await createOfflineOrderService(tenantId, data);

    res.status(201).json(successResponse("Order created successfully", { data: order }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
}

// get all user orders
export const getAllUserOrdersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userID = req.params.id;

    const orders = await getAllUserOrdersServices(tenantId, userID);

    res.status(200).json(
      successResponse("Orders fetched successfully", {
        total: orders.length,
        data: orders,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const orders = await getAllOrdersService(tenantId, filters);

    res.status(200).json(
      successResponse("Orders fetched successfully", {
        total: orders.length,
        data: orders,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
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
    res.status(200).json(
      successResponse("Order updated successfully", {
        data: updatedOrder,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getOrderProductController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: orderId } = req.params;

    // Logic to get products for the given orderId
    const products = await getOrderProductService(tenantId, orderId);
    res.status(200).json(
      successResponse("Order products fetched successfully", {
        data: products,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getOrderSingleProductController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { order_id, product_unique_id } = req.query;

    // Logic to get products for the given orderId
    const products = await getOrderSingleProductService(tenantId, order_id, product_unique_id);
    return res.status(200).json({
      status: "success",
      message: "Order products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get order products failed:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Failed to fetch order products",
      error: error.message,
    });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    const { status, updated_by, note } = req.body;

    if (!id) {
      return res.status(400).json(errorResponse("Invalid Order ID"));
    }

    if (!status) {
      return res.status(400).json(errorResponse("Status is required"));
    }

    const updatedOrder = await updateOrderStatusService(tenantId, id, status, updated_by, note);

    return res.status(200).json(
      successResponse("Order status updated successfully", {
        data: updatedOrder,
      }),
    );
  } catch (error) {
    if (error.message.includes("already in")) {
      return res.status(400).json(errorResponse(error.message));
    }
    return res.status(500).json(errorResponse(error.message, error));
  }
};
