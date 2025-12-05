import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createConfigService,
  getAllConfigsService,
  getConfigByIdService,
  getCurrentConfigService,
  updateConfigService,
  deleteConfigService,
} from "./configService.js";

// Create Config
export const createConfigController = async (req, res) => {
  try {
    const data = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await createConfigService(tenantId, data);

    res.status(201).json(successResponse("Config created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get All Configs
export const getAllConfigsController = async (req, res) => {
  try {
    const filters = req.query;
    const tenantId = req.headers["x-tenant-id"];

    const { totalCount, page, limit, totalPages, data } = await getAllConfigsService(tenantId, filters);

    res
      .status(200)
      .json(successResponse("Fetched configs successfully", { totalCount, page, limit, totalPages, data }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Config by ID
export const getConfigByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getConfigByIdService(tenantId, id);

    res.status(200).json(successResponse("Config fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Current Config
export const getCurrentConfigController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const response = await getCurrentConfigService(tenantId);

    res.status(200).json(successResponse("Current config fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Update Config By Id
export const updateConfigController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateConfig = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await updateConfigService(tenantId, id, updateConfig);

    res.status(200).json(successResponse("Config updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Delete Config By Id
export const deleteConfigController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await deleteConfigService(tenantId, id);

    res.status(200).json(successResponse("Config deleted successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
