import express from "express";
import {
  getWishlistController,
  getWishlistProductsController,
  removeWishlistController,
  createWishlistController,
  clearWishlistController,
  moveWishlistToCartController,
} from "./wishlistController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const route = express.Router();

route.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-wishlist",
  }),
  createWishlistController
);

route.get(
  "/userWhishlist/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-user-whishlist",
  }),
  getWishlistProductsController
);

route.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-wishlist",
  }),
  getWishlistController
);

route.put(
  "/move-to-cart/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "move-to-cart",
  }),
  moveWishlistToCartController
);

route.delete(
  "/clear",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "clear-wishlist",
  }),
  clearWishlistController
);

route.delete(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "remove-wishlist",
  }),
  removeWishlistController
);

export default route;
