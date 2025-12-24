import parseFormData from "../utils/parseFormDataIntoJsonData.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { createBrandService, getAllBrandsService, getBrandByIdService, updateBrandService } from "./brandService.js";

// Create Brand
export const createBrandController = async (req, res) => {
  try {
    let { image_base64, ...data } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    let fileBuffer = null;

    if (image_base64) {
      // Remove base64 header if present
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const response = await createBrandService(tenantId, data, fileBuffer);

    res.status(201).json(successResponse("Brand created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get All Brands
export const getAllBrandsController = async (req, res) => {
  try {
    console.time("API Call"); 
    const filters = req.query;
    const tenantId = req.headers["x-tenant-id"];

    const { totalCount, page, limit, totalPages, data } = await getAllBrandsService(tenantId, filters);

    res.status(200).json(successResponse("Fetched brands successfully", { totalCount, page, limit, totalPages, data }));
    console.timeEnd("API Call");
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Brand by ID
export const getBrandByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getBrandByIdService(tenantId, id);

    res.status(200).json(successResponse("Brand fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Update Brand By Id
export const updateBrandController = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_base64, ...payload } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    let fileBuffer = null;

    if (image_base64) {
      // Remove base64 header if present
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const response = await updateBrandService(tenantId, id, payload, fileBuffer);

    res.status(200).json(successResponse("Brand updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
