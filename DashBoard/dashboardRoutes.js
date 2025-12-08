import { Router } from "express";

import { getOrdersByStatusController, getOrdersTrendController, getTopBrandsByCategory, getTopProductsByCategory, getUsersTrendController } from "./dashboardController.js";

const router = Router();

router.get("/topbrands", getTopBrandsByCategory);
router.get("/topproducts", getTopProductsByCategory);
router.get("/orders/status",getOrdersByStatusController)
router.get("/orders/trend", getOrdersTrendController);
router.get("/users/trend", getUsersTrendController);

export default router;
