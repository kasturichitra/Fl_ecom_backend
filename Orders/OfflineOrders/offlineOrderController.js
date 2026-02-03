import { errorResponse, successResponse } from "../../utils/responseHandler.js";
import { createOfflineOrderService } from "./offlineOrderService.js";

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
