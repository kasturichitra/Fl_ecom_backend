import express from "express";
import {
  createSaleTrendController,
  getAllSaleTrendsController,
  getSaleTrendByUniqueIdController,
  updateSaleTrendController,
  deleteSaleTrendController,
  addProductsToTrendController,
  removeProductsFromTrendController,
} from "./saleTrendController.js";

const route = express.Router();

route.post("/", createSaleTrendController);
route.get("/", getAllSaleTrendsController);
route.get("/:id", getSaleTrendByUniqueIdController);
route.put("/:id", updateSaleTrendController);
route.delete("/:id", deleteSaleTrendController);

// Atomic updates for products
route.put("/:id/add-products", addProductsToTrendController);
route.put("/:id/remove-products", removeProductsFromTrendController);

export default route;
