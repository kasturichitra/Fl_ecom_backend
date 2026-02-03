import { Router } from "express";
import { createOfflineOrderController, getAllOfflineOrdersController } from "./offlineOrderController.js";

const router = Router();

router.post("/", createOfflineOrderController);
router.get("/all", getAllOfflineOrdersController);

export default router;
