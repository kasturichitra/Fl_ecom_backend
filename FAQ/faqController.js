import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAdminFaqTreeService, createFaqService, updateFaqService, toggleFaqStatusService } from "./faqService.js";

export const getAdminFaqTreeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const response = await getAdminFaqTreeService(tenantId);
    res.status(200).json(successResponse("Faq tree fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const createFaqController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const faqPayload = req.body;

    const response = await createFaqService(tenantId, faqPayload);
    res.status(200).json(successResponse("Faq created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateFaqController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: faqId } = req.params;
    const faqPayload = req.body;

    const response = await updateFaqService(tenantId, faqId, faqPayload);
    res.status(200).json(successResponse("Faq updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const toggleFaqStatusController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: faqId } = req.params;

    const response = await toggleFaqStatusService(tenantId, faqId);
    res.status(200).json(successResponse("Faq status updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};