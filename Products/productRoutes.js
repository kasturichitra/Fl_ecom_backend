import express from "express";

import getUploadMiddleware from "../utils/multerConfig.js";
import {
  createBulkProductsController,
  createProductController,
  deleteProductController,
  downloadExcelTemplateController,
  generateProductQrPdfController,
  // getProductByIdController,
  // getProductsBysubUniqeIDController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "./productController.js";
import verifyPermission from "../utils/verifyPermission.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();
const upload = getUploadMiddleware("Product");

router.post(
  "/",
  verifyToken,
  // verifyPermission("product:create"),
  createProductController
);

router.post("/bulk", verifyToken, upload.single("file"), createBulkProductsController);
router.get("/:id", getProductByIdController);
router.get("/", getAllProductsController);
router.put("/:id", verifyToken, updateProductController);
router.delete("/:id", verifyToken, deleteProductController);

// Get excel template
router.get("/excel-template/:id", verifyToken, downloadExcelTemplateController);

router.put("/qr-pdf/:id", verifyToken, generateProductQrPdfController);

// router.get("/sub-category/:id", getProductsBysubUniqeIDController);
// Bottom to ensure express routing error doesn't happen
// router.get("/:id", getProductByIdController);

export default router;
