import { Router } from "express";
import { getAllPermissionsController } from "./permissionController.js";

const router = Router();

router.get("/", getAllPermissionsController);

export default router;
