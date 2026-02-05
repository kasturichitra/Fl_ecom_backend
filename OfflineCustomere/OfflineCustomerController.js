import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getByCustomerInfoService } from "./OfflineCustomerService.js";

export const getByCustomerInfoCController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { mobile_number } = req.params;
    const result = await getByCustomerInfoService(tenantId, mobile_number);
    res.status(200).json(successResponse("Customer info fetched successfully", { data: result }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
