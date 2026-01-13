import { Router } from "express";
import {
  createRoleController,
  deleteRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleController,
} from "./roleController.js";

const router = Router();

router.get("/", getAllRolesController);
router.post("/", createRoleController);
router.put("/:id", updateRoleController);
router.delete("/:id", deleteRoleController);
router.get("/:id", getRoleByIdController);

export default router;
