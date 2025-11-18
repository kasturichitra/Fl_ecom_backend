import express from "express";

import getUploadMiddleware from "../utils/multerConfig.js";
import {
  createProductController,
  deleteProductController,
  downloadExcelTemplateController,
  // getProductByIdController,
  // getProductsBysubUniqeIDController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "./productController.js";

const router = express.Router();
const upload = getUploadMiddleware("Product");

router.post(
  "/",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_images", maxCount: 5 },
  ]),
  createProductController
);
router.get("/:id", getProductByIdController);
router.get("/", getAllProductsController);
router.put(
  "/:id",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_images", maxCount: 5 },
  ]),
  updateProductController
);
router.delete("/:id", deleteProductController);

// Get excel template
router.get("/excel-template/:id", downloadExcelTemplateController);

// router.get("/sub-category/:id", getProductsBysubUniqeIDController);
// Bottom to ensure express routing error doesn't happen
// router.get("/:id", getProductByIdController);

export default router;
