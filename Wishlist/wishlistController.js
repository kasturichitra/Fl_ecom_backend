import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  getWishlistProductsServices,
  getWishlistServices,
  removeWishlistServices,
  createWishlistServices,
  clearWishlistServices,
  moveWishlistToCartServices,
} from "./wishlistService.js";

/* ---------------------------------------------
   CREATE WISHLIST
----------------------------------------------*/
export const createWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { user_id, product_id } = req.body;

    const response = await createWishlistServices(tenantID, user_id, product_id);

    res.status(201).json(successResponse("Product added to wishlist successfully", { data: response }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

/* ---------------------------------------------
   GET WISHLIST PRODUCTS
----------------------------------------------*/
export const getWishlistProductsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const { data, totalCount } = await getWishlistProductsServices(tenantID, user_id);
    res.status(200).json(successResponse("Wishlist products fetched successfully", { data, totalCount }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

/* ---------------------------------------------
   GET WISHLIST (ONLY IDS)
----------------------------------------------*/
export const getWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const response = await getWishlistServices(tenantID, user_id);
    res.status(200).json(successResponse("Wishlist fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

/* ---------------------------------------------
   REMOVE FROM WISHLIST
----------------------------------------------*/
export const removeWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;
    const { product_id } = req.body;

    const response = await removeWishlistServices(tenantID, user_id, product_id);
    res.status(200).json(successResponse("Product removed from wishlist successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

/* ---------------------------------------------
   MOVE WISHLIST TO CART
----------------------------------------------*/
export const moveWishlistToCartController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const response = await moveWishlistToCartServices(tenantID, user_id);
    res.status(200).json(successResponse("Wishlist moved to cart successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

/* ---------------------------------------------
   CLEAR WISHLIST
----------------------------------------------*/
export const clearWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { user_id } = req.body;

    const response = await clearWishlistServices(tenantID, user_id);
    res.status(200).json(successResponse("Wishlist cleared successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
