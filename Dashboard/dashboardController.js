import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  getAllDeadStockService,
  getAllLowStockProductsService,
  getAllofflinePamentTransactionService,
  getFastMovingProductsService,
  // getOfflineOrdersTrendService,
  getOrdersByOrderType,
  getOrdersByPaymentMethod,
  getOrdersByStatus,
  getOrdersTrendService,
  getTopBrandsByCategoryService,
  getTopOrderUsersByAmountService,
  getTopProductsByCategoryService,
  getTotalCountsService,
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

export const getOfflineOrdersTrendController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getOfflineOrdersTrendService(tenantID, filters);

    res.status(200).json(successResponse("Offline orders trend fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching offline orders trend:", error));
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

export const getOrdersByPaymentMethodController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getOrdersByPaymentMethod(tenantID, filters);

    res.status(200).json(successResponse("Orders by payment method fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching orders by payment method:", error));
  }
};

export const getOrdersByOrderTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getOrdersByOrderType(tenantID, filters);

    res.status(200).json(successResponse("Orders by order type fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching orders by order type:", error));
  }
};

export const getTotalCountsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];

    const data = await getTotalCountsService(tenantID);
    res.status(200).json(successResponse("Total counts fetched successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching total counts:", error));
  }
};

export const getAllLowStockProductsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await getAllLowStockProductsService(tenantId, req.query);
    res.status(200).json(successResponse("stock products fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllDeadStockController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await getAllDeadStockService(tenantId, req.query);
    res.status(200).json(successResponse("Dead stock products fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getFastMovingProductsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await getFastMovingProductsService(tenantId, req.query);
    res.status(200).json(successResponse("Fast moving products fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// offline order aggregations
export const getAllofflinePamentTransactionController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getAllofflinePamentTransactionService(tenantID, filters);

    res.status(200).json(successResponse("Offline orders by payment method fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching offline orders by payment method:", error));
  }
};

export const getAllTopOrderUsersByAmountController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getTopOrderUsersByAmountService(tenantID, filters);

    res.status(200).json(successResponse("Top order users fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse("Error fetching top order users:", error));
  }
};
