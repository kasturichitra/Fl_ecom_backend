import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createOrderServices,
  getAllUserOrdersServices,
  getAllOrdersService,
  updateOrderService,
  getOrderProductService,
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
      })
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
      })
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
      })
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
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
