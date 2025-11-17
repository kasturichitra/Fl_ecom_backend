import express from "express";
import verifyToken from "../utils/verifyToken.js";

import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  // getProductByIdController,
  // getProductsBysubUniqeIDController,
  getAllProductsController,
  updateProductController,
  downloadExcelTemplateController,
} from "./productController.js";
import getUploadMiddleware from "../utils/multerConfig.js";

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
router.get(
  "/",
  // verifyToken,
  getAllProductsController
);
router.put(
  "/:id",
  // verifyToken,
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_images", maxCount: 5 },
  ]),
  updateProductController
);
router.delete("/:id", deleteProductController);

// Get excel template 
router.get("/excel-template/:id", downloadExcelTemplateController);

// router.get("/sub-category/:id", verifyToken, getProductsBysubUniqeIDController);
// Bottom to ensure express routing error doesn't happen
// router.get("/:id", getProductByIdController);

export default router;
