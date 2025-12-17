import express from "express";
import {
  addAddressController,
  deleteUserAccountController,
  deleteUserAddressController,
  employeCreateController,
  getAllUsersController,
  getUserByIdController,
  storeFcmTokenController,
  updateUserAddressController,
  updateUserController,
} from "./userController.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const route = express.Router();
const upload = getUploadMiddleware("user");

route.get("/user", getAllUsersController);
route.get("/user/:id", getUserByIdController);

// User Update
route.put("/user/:id", upload.single("image"), updateUserController);

// Address
route.post("/user/:user_id/address", addAddressController);
route.put("/user/:id/address/:address_id", updateUserAddressController);
route.delete("/user/:id/address/:address_id", deleteUserAddressController);

route.put("/user/fcm-token/:id", storeFcmTokenController);

// Employee Create (Admin only)
route.post("/employe", upload.single("image"), employeCreateController);

route.delete("/user/:id", deleteUserAccountController);

export default route;
