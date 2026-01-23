import { Router } from "express";
import { getAllEcomFeaturesController, updateEcomFeaturesController } from "./ecomFeatureController.js";

const router = Router();

router.get("/", getAllEcomFeaturesController); 
router.put("/", updateEcomFeaturesController); 

export default router;