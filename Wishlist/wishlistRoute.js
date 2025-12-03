import express from "express";
import {
  getWishlistController,
  getWishlistProductsController,
  removeWishlistController,
  createWishlistController,
  clearWishlistController,
} from "./wishlistController.js";

const route = express.Router();

route.post("/", createWishlistController);
route.get("/userWhishlist/:id", getWishlistProductsController);
route.get("/:id", getWishlistController);
route.delete("/:id", removeWishlistController);
route.delete("/clear/:id", clearWishlistController);

export default route;
