import { Router } from "express";
import { createOfflineOrderController } from "./offlineOrderController.js";

const router = Router();

router.post("/2", createOfflineOrderController);

export default router;