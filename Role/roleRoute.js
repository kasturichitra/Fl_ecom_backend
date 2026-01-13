import { Router } from "express";
import { createRoleController } from "./roleController.js";

const router = Router();

router.post("/", createRoleController);

export default router;
