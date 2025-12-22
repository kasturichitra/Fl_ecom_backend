import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getContactInfoService, updateContactInfoService } from "./contactInfoService.js";

export const getContactInfo = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const result = await getContactInfoService(tenantId);
    res.status(200).json(successResponse("Contact Info fetched successfully", { data: result }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const updates = {
      ...req.body,
      ...(req.file && { logo_image: req.file.path }),
    };
    const result = await updateContactInfoService(tenantId, updates);
    res.status(200).json(successResponse("Contact Info saved successfully", { data: result }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
