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
route.delete("/clear", clearWishlistController);
route.delete("/:id", removeWishlistController);

export default route;
