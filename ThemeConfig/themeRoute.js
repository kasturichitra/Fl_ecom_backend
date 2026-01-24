import express from "express";
import { createThemeController, getAllThemeController, getByThemeController, updateThemeController } from "./themeController.js";

const router = express.Router();

router.post("/", createThemeController);
router.get("/", getAllThemeController);
router.get("/:template_id", getByThemeController);
router.put("/:template_id", updateThemeController);

export default router;
