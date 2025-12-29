import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  createIndustryTypeController,
  deleteIndustrytypeController,
  getIndustrysSearchController,
  //   getIndustrytypesController,
  updateIndustryTypeController,
} from "./industryTypeController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const route = express.Router();

route.post(
  "/",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-industry",
  }),
  createIndustryTypeController
);

route.put(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "update-industry",
  }),
  updateIndustryTypeController
);

route.get(
  "/search",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-industries",
  }),
  getIndustrysSearchController
);

route.delete(
  "/delete/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "delete-industry",
  }),
  deleteIndustrytypeController
);

// route.get("/", getIndustrytypesController);

export default route;
