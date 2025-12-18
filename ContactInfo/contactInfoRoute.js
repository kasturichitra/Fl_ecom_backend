import express from "express";

import verifyToken from "../utils/verifyToken.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import { getContactInfo, updateContactInfo } from "./contactInfoController.js";

const router = express.Router();
const upload = getUploadMiddleware("contactInfo");

// Publicly accessible GET
router.get("/", getContactInfo);

router.put("/create", upload.single("logo_image"), updateContactInfo);


export default router;
