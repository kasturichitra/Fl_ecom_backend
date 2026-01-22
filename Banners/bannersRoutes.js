import express from "express";
import getUploadMiddleware from "../utils/multerConfig.js";
import verifyToken from "../utils/verifyToken.js";
import {
  createBannerController,
  getAllBannersController,
  getBannerByUniqueIdController,
  updateBannerController,
  deleteBannerController,
} from "./bannerController.js";

const route = express.Router();

const upload = getUploadMiddleware("Banners");

// POST - Create a new banner
route.post("/", verifyToken, upload.single("banner_image"), createBannerController);

// GET - Get all banners with filtering and pagination
route.get("/", getAllBannersController);

// GET - Get banner by unique ID
route.get("/:banner_unique_id", getBannerByUniqueIdController);

// PUT - Update banner by unique ID
route.put("/:banner_unique_id", verifyToken, upload.single("banner_image"), updateBannerController);

// DELETE - Soft delete banner by unique ID
route.delete("/:banner_unique_id", verifyToken, deleteBannerController);

export default route;
