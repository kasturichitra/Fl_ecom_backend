import express from "express";
import {
  addToCartController,
  getCartByUserIdController,
  removeFromCartController,
  updateCartQuantityController,
  clearCartController,
} from "./cartController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();

router.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "add-to-cart",
  }),
  addToCartController
);

router.get(
  "/:user_id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-cart-by-user-id",
  }),
  getCartByUserIdController
);

router.put(
  "/remove",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "remove-from-cart",
  }),
  removeFromCartController
);

router.put(
  "/update-quantity",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "update-cart-quantity",
  }),
  updateCartQuantityController
);

router.delete(
  "/clear",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "clear-cart",
  }),
  clearCartController
);

export default router;
