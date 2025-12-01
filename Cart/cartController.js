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

    const response = await addToCartService(tenantId, data);

    res.status(201).json({
      status: "Success",
      message: "Product added to cart successfully",
      data: response,
    });
  } catch (error) {
    console.error("Add to Cart Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};

export const getCartByUserIdController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const {
      data, 
      totalCount
    } = await getCartByUserIdService(tenantId, user_id);

    res.status(200).json({
      status: "Success",
      message: "Cart fetched successfully",
      data, 
      totalCount
    });
  } catch (error) {
    console.error("Get Cart By User ID Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

export const removeFromCartController = async (req, res) => {
  try {
    const { user_id, product_unique_id } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await removeFromCartService(tenantId, user_id, product_unique_id);

    res.status(200).json({
      status: "Success",
      message: "Product removed from cart successfully",
      data: response,
    });
  } catch (error) {
    console.error("Remove from Cart Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to remove product from cart",
      error: error.message,
    });
  }
};

export const updateCartQuantityController = async (req, res) => {
  try {
    const { user_id, product_unique_id, quantity } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await updateCartQuantityService(tenantId, user_id, product_unique_id, quantity);

    res.status(200).json({
      status: "Success",
      message: "Cart quantity updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Update Cart Quantity Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to update cart quantity",
      error: error.message,
    });
  }
};

export const clearCartController = async (req, res) => {
  try {
    const { user_id } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    const response = await clearCartService(tenantId, user_id);

    res.status(200).json({
      status: "Success",
      message: "Cart cleared successfully",
      data: response,
    });
  } catch (error) {
    console.error("Clear Cart Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
