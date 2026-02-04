import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllOfflineOrderTransactionsService } from "./offlineOrderTransactionsService.js";

export const getAllOfflineOrderTransactionsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const response = await getAllOfflineOrderTransactionsService(tenantId, filters);
    res.status(200).json(successResponse("Offline order transactions fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
