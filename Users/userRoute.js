import express from "express";
import {
  addAddressController,
  employeCreateController,
  getAllUsersController,
  getUserByIdController,
  loginUserController,
  registerUserController,
  storeFcmTokenController,
  updateUserAddressController,
  updateUserController,
} from "./userController.js";

import verifyToken from "../utils/verifyToken.js";
import verifyAdmin from "../utils/verifyAdmin.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const route = express.Router();
const upload = getUploadMiddleware("user");

// Auth
route.post("/register", registerUserController);
route.post("/login", loginUserController);

route.get("/user", getAllUsersController);
route.get("/user/:id", getUserByIdController)

// User Update
route.put("/:id", verifyToken, upload.single("image"), updateUserController);

// Address
route.post("/:user_id/address", verifyToken, addAddressController);
route.put("/:id/address/:address_id", verifyToken, updateUserAddressController);

route.put("/fcm-token/:id", storeFcmTokenController); 

// Employee Create (Admin only)
route.post("/employe", 
  // verifyToken, 
  // ?verifyAdmin, 
  employeCreateController);

export default route;



// import express from "express";
// import {
//   addAddressController,
//   employeCreateController,
//   loginUserController,
//   registerUserController,
//   updateUserAddressController,
//   updateUserController,
// } from "./userController.js";
// import verifyToken from "../utils/verifyToken.js";
// import getUploadMiddleware from "../utils/multerConfig.js";
// import verifyAdmin from "../utils/verifyAdmin.js";

// const route = express.Router();
// const upload = getUploadMiddleware("user");

// route.post("/register", registerUserController);
// route.post("/login", loginUserController);
// route.put("/:id", verifyToken, upload.single("image"), updateUserController);

// route.post("/:userID/address", verifyToken, addAddressController);
// route.put("/:id/address/:addressId", verifyToken, updateUserAddressController);

// route.post("/employe", verifyToken, verifyAdmin, employeCreateController);

// export default route;
