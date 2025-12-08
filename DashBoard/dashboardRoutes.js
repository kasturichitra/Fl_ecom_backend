import { Router } from "express";

import { getOrdersTrendController, getTopBrandsByCategory, getTopProductsByCategory } from "./dashboardController.js";

const router = Router();

router.get("/topbrands", getTopBrandsByCategory);
router.get("/topproducts", getTopProductsByCategory);
router.get("/trend", getOrdersTrendController); 

export default router;
