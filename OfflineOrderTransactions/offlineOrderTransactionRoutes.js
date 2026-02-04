import { Router } from "express";
import { getAllOfflineOrderTransactionsController } from "./offlineOrderTransactionsController.js";

const router = Router();

router.get("/", getAllOfflineOrderTransactionsController);

export default router;
