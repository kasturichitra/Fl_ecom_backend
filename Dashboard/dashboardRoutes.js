import express from "express";
import {
    getTopBrandsByCategory,
    getTopProductsByCategory,
} from "./dashboardController.js";

const router = express.Router();

router.get("/topbrands", getTopBrandsByCategory);
router.get("/topproducts", getTopProductsByCategory);

export default router;
