import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createSaleTrendService,
  getAllSaleTrendsService,
  getSaleTrendByUniqueIdService,
  updateSaleTrendService,
  deleteSaleTrendService,
  // addProductsToTrendService,
  // removeProductsFromTrendService,
} from "./saleTrendService.js";

export const createSaleTrendController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const data = req.body;
    const newTrend = await createSaleTrendService(tenantId, data);
    res.status(201).json(successResponse("Sale Trend created successfully", { data: newTrend }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

export const getAllSaleTrendsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;
    const result = await getAllSaleTrendsService(tenantId, filters);
    res.status(200).json(successResponse("Sale Trends fetched successfully", result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

export const getSaleTrendByUniqueIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: trend_unique_id } = req.params;
    const trend = await getSaleTrendByUniqueIdService(tenantId, trend_unique_id);
    res.status(200).json(successResponse("Sale Trend fetched successfully", { data: trend }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

export const updateSaleTrendController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: trend_unique_id } = req.params;
    const updateData = req.body;
    const updatedTrend = await updateSaleTrendService(tenantId, trend_unique_id, updateData);
    res.status(200).json(successResponse("Sale Trend updated successfully", { data: updatedTrend }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

export const deleteSaleTrendController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: trend_unique_id } = req.params;
    const deletedTrend = await deleteSaleTrendService(tenantId, trend_unique_id);
    res.status(200).json(successResponse("Sale Trend deleted successfully", { data: deletedTrend }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, err));
  }
};

// export const addProductsToTrendController = async (req, res) => {
//   try {
//     const tenantId = req.headers["x-tenant-id"];
//     const { id } = req.params;
//     const { product_unique_ids } = req.body; // Expecting array of IDs in body

//     const updatedTrend = await addProductsToTrendService(tenantId, id, product_unique_ids);
//     res.status(200).json(successResponse("Products added to Sale Trend successfully", { data: updatedTrend }));
//   } catch (err) {
//     res.status(500).json(errorResponse(err.message, err));
//   }
// };

// export const removeProductsFromTrendController = async (req, res) => {
//   try {
//     const tenantId = req.headers["x-tenant-id"];
//     const { id } = req.params;
//     const { product_unique_ids } = req.body; // Expecting array of IDs in body

//     const updatedTrend = await removeProductsFromTrendService(tenantId, id, product_unique_ids);
//     res.status(200).json(successResponse("Products removed from Sale Trend successfully", { data: updatedTrend }));
//   } catch (err) {
//     res.status(500).json(errorResponse(err.message, err));
//   }
// };
