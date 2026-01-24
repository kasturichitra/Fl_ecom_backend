import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { createThemeService, getAllThemeService, getByThemeService, updateThemeService } from "./themeService.js";

export const createThemeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const theme = await createThemeService(tenantId, req.body);

    res.status(201).json(successResponse("Theme created successfully", { data: theme }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllThemeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const theme = await getAllThemeService(tenantId);

    res.status(200).json(successResponse("Theme fetched successfully", { data: theme }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getByThemeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { template_id } = req.params;

    const theme = await getByThemeService(tenantId, template_id);

    res.status(200).json(successResponse("Theme fetched successfully", { data: theme }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};


export const updateThemeController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { template_id } = req.params;

    const theme = await updateThemeService(tenantId, template_id, req.body);

    res.status(200).json(successResponse("Theme updated successfully", { data: theme }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};