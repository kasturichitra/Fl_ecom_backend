import { Router } from "express";
import { createRoleController, getAllRolesController } from "./roleController.js";

const router = Router();

router.get("/", getAllRolesController);
router.post("/", createRoleController);

export default router;
