import express from "express";
import {
  createConfigController,
  getAllConfigsController,
  getConfigByIdController,
  getCurrentConfigController,
  updateConfigController,
  deleteConfigController,
} from "./configController.js";

const router = express.Router();

// Create config
router.post("/", createConfigController);

// Get current config (convenience endpoint)
router.get("/current", getCurrentConfigController);

// Get all configs (with filters, pagination, sorting)
router.get("/", getAllConfigsController);

// Get config by ID
router.get("/:id", getConfigByIdController);

// Update config
router.put("/:id", updateConfigController);

// Delete config
router.delete("/:id", deleteConfigController);

export default router;
