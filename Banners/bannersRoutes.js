import express from "express";
import {
  createBannerController,
  deleteBannerController,
  getAllBannersController,
  updateBannerController,
} from "./bannerController.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const route = express.Router();

const upload = getUploadMiddleware("Banners");

route.post("/", upload.single("banner_image"), createBannerController);
route.get("/", getAllBannersController);
route.put("/:id", upload.single("banner_image"), updateBannerController);
route.delete("/:id", deleteBannerController);

export default route;
