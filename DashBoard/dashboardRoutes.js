import { Router } from "express";

import { getOrdersByStatusController, getOrdersTrendController, getTopBrandsByCategory, getTopProductsByCategory } from "./dashboardController.js";

const router = Router();

router.get("/topbrands", getTopBrandsByCategory);
router.get("/topproducts", getTopProductsByCategory);
router.get("/trend", getOrdersTrendController); 
router.get("/orders_status",getOrdersByStatusController)

export default router;
