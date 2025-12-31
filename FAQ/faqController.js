import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAdminFaqTreeService } from "./faqService.js";

export const getAdminFaqTreeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const response = await getAdminFaqTreeService(tenantId);
    res.status(200).json(successResponse("Faq tree fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
