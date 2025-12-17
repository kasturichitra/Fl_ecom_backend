import express from "express";
import {
  createBannerController,
  deleteBannerController,
  getAllBannersController,
  updateBannerController,
} from "./bannerController.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import verifyToken from "../utils/verifyToken.js";

const route = express.Router();

const upload = getUploadMiddleware("Banners");

route.post("/", verifyToken, upload.single("banner_image"), createBannerController);
route.get("/", getAllBannersController);
route.put("/:id", verifyToken, upload.single("banner_image"), updateBannerController);
route.delete("/:id", verifyToken, deleteBannerController);

export default route;
