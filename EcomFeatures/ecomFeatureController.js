import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllEcomFeaturesService, updateEcomFeaturesService } from "./ecomFeatureService.js";

export const getAllEcomFeaturesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const response = await getAllEcomFeaturesService(tenantId);
    res.status(200).json(successResponse("Ecom Features fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateEcomFeaturesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const payload = req.body;

    const response = await updateEcomFeaturesService(tenantId, payload);
    res.status(200).json(successResponse("Ecom Features updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
