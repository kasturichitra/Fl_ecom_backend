import express from "express";
import { gstinVerifyController } from "./businessController.js";

const router = express.Router();

router.post("/gstinverify", gstinVerifyController);

export default router;
