import express from "express";
import rateLimiter from "../lib/redis/rateLimiter.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import {
  addAddressController,
  deleteUserAccountController,
  deleteUserAddressController,
  employeCreateController,
  getAllRolesController,
  getAllUsersController,
  getUserByIdController,
  storeFcmTokenController,
  updateEmployeeController,
  updateUserAddressController,
  updateUserController,
} from "./userController.js";

const route = express.Router();
const upload = getUploadMiddleware("user");

route.get(
  "/user",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-users",
  }),
  getAllUsersController,
);

route.get(
  "/user/roles",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-user-roles",
  }),
  getAllRolesController,
);

route.get(
  "/user/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-user-by-id",
  }),
  getUserByIdController,
);

// User Update
route.put(
  "/user/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-user",
  }),
  upload.single("image"),
  updateUserController,
);

// Address
route.post(
  "/user/:user_id/address",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "add-user-address",
  }),
  addAddressController,
);

route.put(
  "/user/:id/address/:address_id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-user-address",
  }),
  updateUserAddressController,
);

route.delete(
  "/user/:id/address/:address_id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-user-address",
  }),
  deleteUserAddressController,
);

route.put(
  "/user/fcm-token/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-user-fcm-token",
  }),
  storeFcmTokenController,
);

// Employee Create (Admin only)
route.post(
  "/employe",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-employe",
  }),
  upload.single("image"),
  employeCreateController,
);

route.put(
  "/updatedEmploye/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-employe",
  }),
  upload.single("image"),
  updateEmployeeController,
);
route.delete(
  "/user/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-user-account",
  }),
  deleteUserAccountController,
);

export default route;
