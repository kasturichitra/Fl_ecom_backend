import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  createBrandController,
  getAllBrandsController,
  getBrandByIdController,
  updateBrandByIdController,
} from "./brandController.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const router = express.Router();
const upload = getUploadMiddleware("brands");

// Create brand
router.post(
  "/",
  // verifyToken,
  upload.fields([
    { name: "brand_image", maxCount: 1 },
    { name: "brand_images", maxCount: 10 },
  ]),
  createBrandController
);

// Get all brands (with filters, pagination, sorting)
router.get(
  "/",
  // verifyToken,
  getAllBrandsController
);

// Get brand by ID
router.get(
  "/:id",
  // verifyToken,
  getBrandByIdController
);

// Update brand
router.put(
  "/:id",
  upload.none(),
  // verifyToken,
  updateBrandByIdController
);

export default router;
