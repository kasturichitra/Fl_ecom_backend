import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  addBusinessDetailsService,
  deactivateBusinessService,
  getAllBusinessDetailsService,
  getAssignedBusinessDetailsService,
  getBusinessDetailsService,
  gstinVerifyService,
  updateBusinessDetailsService,
} from "./businessService.js";
import { validateBusinessDetails } from "./businessValidation.js";

export const gstinVerifyController = async (req, res) => {
  try {
    const response = await gstinVerifyService(req.body);
    res.status(200).json(successResponse("Gstin Verify Success", response));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

export const addBusinessDetailsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const validation = validateBusinessDetails({ ...req.body, user_id });

    if (!validation.isValid) {
      return res.status(400).json(errorResponse(validation.message, validation.errors));
    }

    const response = await addBusinessDetailsService(tenantId, user_id, req.body, req.files);
    res.status(200).json(successResponse(response.message, { data: response.user }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getBusinessDetailsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: business_unique_id } = req.params;
    const response = await getBusinessDetailsService(tenantId, business_unique_id);
    res.status(200).json(successResponse("Business details fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllBusinessDetailsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await getAllBusinessDetailsService(tenantId);
    res.status(200).json(successResponse("Business details fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAssignedBusinessDetailsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;
    const response = await getAssignedBusinessDetailsService(tenantId, user_id);
    res.status(200).json(successResponse("Business details fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateBusinessDetailsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: business_unique_id } = req.params;
    const response = await updateBusinessDetailsService(tenantId, business_unique_id, req.body);
    res.status(200).json(successResponse("Business details updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const deactivateBusinessController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: user_id, getinumber } = req.params;
    const response = await deactivateBusinessService(tenantId, user_id, getinumber);
    res.status(200).json(successResponse("Business deactivated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
