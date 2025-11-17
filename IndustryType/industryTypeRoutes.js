import express from "express";
import { createIndustryTypeController, deleteIndustrytypeController, getIndustrySearchController, getIndustrytypesController, updateIndustryTypeController } from "./industryTypeControllers.js";
import getUploadMiddleware from "../utils/multerConfig.js";
// import { safeUpload } from "../utils/safeUpload.js";

const route = express.Router();

const upload = getUploadMiddleware("IndustryType");

route.post(
    "/create",
    //    safeUpload(
    upload.single("image"),
    // ), 
    createIndustryTypeController
);
route.put("/updateIndustryType/:id", upload.single("image"), updateIndustryTypeController)
route.get("/searchIndustry", getIndustrySearchController);

route.get("/getAllIndustryType", getIndustrytypesController)
route.delete("/deleteIndustryType/:id", deleteIndustrytypeController)

export default route;
