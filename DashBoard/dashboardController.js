import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  getOrdersTrendService,
  getTopBrandsByCategoryService,
  getTopProductsByCategoryService,
} from "./dashboardService.js";

export const getTopBrandsByCategory = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const data = await getTopBrandsByCategoryService(tenantID);
    res.status(200).json(successResponse("Top brands by category fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching top brands:", error));
  }
};

export const getTopProductsByCategory = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const data = await getTopProductsByCategoryService(tenantID);
    res.status(200).json(successResponse("Top products by category fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching top products:", error));
  }
};

export const getOrdersTrendController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const result = await getOrdersTrendService(tenantID, filters);

    res.status(200).json(successResponse("Orders trend fetched successfully", { data: result }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching orders trend:", error));
  }
};
