

import express from 'express'
import { createBannersController, deleteBannerController, getBannersController, updateBannerController } from './bannersControllers.js'
import getUploadMiddleware from '../utils/multerConfig.js'


const route = express.Router()


const upload = getUploadMiddleware("Banners")


route.post("/create", upload.single("banner_image"), createBannersController)
route.get("/getBanners", getBannersController)
route.put("/updateBanner/:id", upload.single("banner_image"), updateBannerController)
route.delete("/delete/:id", deleteBannerController);
export default route