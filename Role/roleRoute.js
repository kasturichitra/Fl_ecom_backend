import { Router } from "express";
import { createRoleController, getAllRolesController, updateRoleController } from "./roleController.js";

const router = Router();

router.get("/", getAllRolesController);
router.post("/", createRoleController);
router.put("/:id", updateRoleController);

export default router;
