import { Router } from "express";
import { createOfflineOrderController, getAllOfflineOrdersController, getOfflineOrderByIdController } from "./offlineOrderController.js";

const router = Router();

router.post("/", createOfflineOrderController);
router.get("/", getAllOfflineOrdersController);
router.get("/:id", getOfflineOrderByIdController)

export default router;
