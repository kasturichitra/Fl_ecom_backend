import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  addToCartService,
  getCartByUserIdService,
  removeFromCartService,
  updateCartQuantityService,
  clearCartService,
} from "./cartService.js";

export const addToCartController = async (req, res) => {
  try {
    const data = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const { cart, isNewlyAdded } = await addToCartService(tenantId, data);

    let resposeMessage;
    if (isNewlyAdded === true) {
      resposeMessage = "Product added to cart successfully";
    } else if (isNewlyAdded === false) {
      resposeMessage = "Product quantity increased successfully";
    }

    res.status(201).json(successResponse(resposeMessage, { data: cart }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getCartByUserIdController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const { data, totalCount } = await getCartByUserIdService(tenantId, user_id);

    res.status(200).json(successResponse("Cart fetched successfully", { data, totalCount }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const removeFromCartController = async (req, res) => {
  try {
    const { user_id, product_unique_id } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await removeFromCartService(tenantId, user_id, product_unique_id);

    res.status(200).json(successResponse("Product removed from cart successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateCartQuantityController = async (req, res) => {
  try {
    const { user_id, product_unique_id, quantity } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await updateCartQuantityService(tenantId, user_id, product_unique_id, quantity);

    res.status(200).json(successResponse("Cart quantity updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const clearCartController = async (req, res) => {
  try {
    const { user_id } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await clearCartService(tenantId, user_id);

    res.status(200).json(successResponse("Cart cleared successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
