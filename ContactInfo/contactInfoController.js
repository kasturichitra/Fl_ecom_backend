import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { sendEmail } from "../utils/sendOTP.js";
import throwIfTrue from "../utils/throwIfTrue.js";
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


export const getInTouchInfo = async (req, res) => {
  // console.log("genIn")
  try {
    // console.log('jai')
    const tenantID = req.headers["x-tenant-id"]

    console.log(tenantID, "tenant_id")

    const { email } = req.body
 
    // sendEmail(email,message,subject)

    const result = await getInTouchService(tenantID,{email})

    res.status(200).json(successResponse("Email successfully sent"), result)
  
  } catch (error) {
    console.log('erro1')
    res.status(500).json(errorResponse(error.message, error));
  }
}