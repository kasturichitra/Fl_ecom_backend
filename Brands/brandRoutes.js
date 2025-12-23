import express from "express";
import {
  createBrandController,
  getAllBrandsController,
  getBrandByIdController,
  updateBrandController,
} from "./brandController.js";
// import getUploadMiddleware from "../utils/multerConfig.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();
// const upload = getUploadMiddleware("brands");

// Create brand
router.post(
  "/",
  verifyToken,
  // upload.fields([
  //   { name: "brand_image", maxCount: 1 },
  //   { name: "brand_images", maxCount: 10 },
  // ]),
  createBrandController
);

// Get all brands (with filters, pagination, sorting)
router.get("/", getAllBrandsController);

// Get brand by ID
router.get("/:id", getBrandByIdController);

// Update brand
router.put("/:id", verifyToken,
  //  upload.single("brand_image"),
    updateBrandController);

export default router;
