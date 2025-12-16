import express from "express";
import {
  addAddressController,
  deleteUserAddressController,
  employeCreateController,
  getAllUsersController,
  getUserByIdController,
  storeFcmTokenController,
  updateUserAddressController,
  updateUserController,
} from "./userController.js";

import verifyToken from "../utils/verifyToken.js";
import verifyAdmin from "../utils/verifyAdmin.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const route = express.Router();
const upload = getUploadMiddleware("user");

route.get("/user", getAllUsersController);
route.get("/user/:id", getUserByIdController);

// User Update
route.put(
  "/user/:id",
  //  verifyToken,
  upload.single("image"),
  updateUserController
);

// Address
route.post(
  "/user/:user_id/address",
  // verifyToken,
  addAddressController
);
route.put(
  "/user/:id/address/:address_id",
  // verifyToken,
  updateUserAddressController
);

route.delete(
  "/user/:id/address/:address_id",
  // verifyToken,
  deleteUserAddressController
);

route.put("/user/fcm-token/:id", storeFcmTokenController);

// Employee Create (Admin only)
route.post(
  "/employe",
  // verifyToken,
  // ?verifyAdmin,
  upload.single("image"),
  employeCreateController
);

export default route;
