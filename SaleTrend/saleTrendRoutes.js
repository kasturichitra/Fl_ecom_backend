import express from "express";
import {
  createSaleTrendController,
  getAllSaleTrendsController,
  getSaleTrendByUniqueIdController,
  updateSaleTrendController,
  deleteSaleTrendController,
  // addProductsToTrendController,
  // removeProductsFromTrendController,
} from "./saleTrendController.js";
import verifyToken from "../utils/verifyToken.js";

const route = express.Router();

route.post("/", verifyToken, createSaleTrendController);
route.get("/", getAllSaleTrendsController);
route.get("/:id", getSaleTrendByUniqueIdController);
route.put("/:id", verifyToken, updateSaleTrendController);
route.delete("/:id", verifyToken, deleteSaleTrendController);

// Atomic updates for products
// route.put("/:id/add-products", addProductsToTrendController);
// route.put("/:id/remove-products", removeProductsFromTrendController);

export default route;
