import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getContactInfoService, getInTouchService, updateContactInfoService } from "./contactInfoService.js";

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
    const { image_base64, ...rest } = req.body;

    let fileBuffer = null;
    if (image_base64) {
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const result = await updateContactInfoService(tenantId, rest, fileBuffer);
    res.status(200).json(successResponse("Contact Info saved successfully", { data: result }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getInTouchInfo = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];

    const { email } = req.body;

    const result = await getInTouchService(tenantID, { email });

    res.status(200).json(successResponse("Email successfully sent"), result);
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
