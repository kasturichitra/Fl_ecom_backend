import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createBannerService,
  getAllBannersService,
  getBannerByUniqueIdService,
  updateBannerService,
  deleteBannerService,
} from "./bannersService.js";

/**
 * Create a new banner
 */
export const createBannerController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const images_base64 = req.body.banner_image || []; // Array of base64 images
    const fileBuffers = [];

    // Convert all base64 images to buffers
    if (Array.isArray(images_base64) && images_base64.length > 0) {
      for (const image_base64 of images_base64) {
        if (image_base64) {
          // Remove base64 header if present
          const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
          fileBuffers.push(Buffer.from(base64Data, "base64"));
        }
      }
    }

    const response = await createBannerService(tenantId, req.body, fileBuffers);

    res.status(201).json(successResponse("Banner created successfully", response));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

/**
 * Get all banners with filtering and pagination
 */
export const getAllBannersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const response = await getAllBannersService(tenantId, filters);

    res.status(200).json(successResponse("Banners retrieved successfully", response));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

/**
 * Get banner by unique ID
 */
export const getBannerByUniqueIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: banner_unique_id } = req.params;

    const response = await getBannerByUniqueIdService(tenantId, banner_unique_id);

    res.status(200).json(successResponse("Banner retrieved successfully", response));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

/**
 * Update banner by unique ID
 */
export const updateBannerController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: banner_unique_id } = req.params;
    const images_base64 = req.body.banner_image || []; // Array of base64 images
    const fileBuffers = [];

    // Convert all base64 images to buffers
    if (Array.isArray(images_base64) && images_base64.length > 0) {
      for (const image_base64 of images_base64) {
        if (image_base64) {
          // Remove base64 header if present
          const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
          fileBuffers.push(Buffer.from(base64Data, "base64"));
        }
      }
    }

    const response = await updateBannerService(tenantId, banner_unique_id, req.body, fileBuffers);

    res.status(200).json(successResponse("Banner updated successfully", response));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

/**
 * Delete banner (soft delete)
 */
export const deleteBannerController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: banner_unique_id } = req.params;

    const response = await deleteBannerService(tenantId, banner_unique_id);

    res.status(200).json(successResponse("Banner deleted successfully", response));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};
