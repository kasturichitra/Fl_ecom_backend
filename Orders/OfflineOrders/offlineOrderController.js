import { errorResponse, successResponse } from "../../utils/responseHandler.js";
import { createOfflineOrderService, getAllOfflineOrdersService } from "./offlineOrderService.js";

export const createOfflineOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const payload = req.body;

    const order = await createOfflineOrderService(tenantId, payload);

    res.status(201).json(successResponse("Order created successfully", { data: order }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllOfflineOrdersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const filters = req.query;

    const orders = await getAllOfflineOrdersService(tenantId, filters);

    res.status(200).json(successResponse("Orders fetched successfully", { data: orders }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};