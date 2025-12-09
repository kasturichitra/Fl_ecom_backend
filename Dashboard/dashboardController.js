import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  getOrdersByStatus,
  getOrdersTrendService,
  getTopBrandsByCategoryService,
  getTopProductsByCategoryService,
  getUsersTrendService,
} from "./dashboardService.js";

export const getTopBrandsByCategory = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;
    const data = await getTopBrandsByCategoryService(tenantID, filters);
    res.status(200).json(successResponse("Top brands by category fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching top brands:", error));
  }
};

export const getTopProductsByCategory = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;
    const data = await getTopProductsByCategoryService(tenantID, filters);
    res.status(200).json(successResponse("Top products by category fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching top products:", error));
  }
};

export const getOrdersTrendController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getOrdersTrendService(tenantID, filters);

    res.status(200).json(successResponse("Orders trend fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching orders trend:", error));
  }
};

export const getUsersTrendController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getUsersTrendService(tenantID, filters);

    res.status(200).json(successResponse("Users trend fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching users trend:", error));
  }
};

export const getOrdersByStatusController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getOrdersByStatus(tenantID, filters);

    res.status(200).json(successResponse("Orders by status fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching orders by status:", error));
  }
};
