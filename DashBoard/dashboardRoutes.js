import { Router } from "express";

import { getTopBrandsByCategory, getTopProductsByCategory } from "./dashboardController.js";

const router = Router();

router.get("/topbrands", getTopBrandsByCategory);
router.get("/topproducts", getTopProductsByCategory);

export default router;
