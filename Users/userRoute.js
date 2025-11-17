import express from 'express';
import { addAddressController, loginUserController, registerUserController, updateUserAddressController, updateUserController } from './userController.js';
import verifyToken from '../utils/verifyToken.js';
import getUploadMiddleware from '../utils/multerConfig.js';


const route = express.Router();
const upload = getUploadMiddleware("user");

route.post('/register', registerUserController)
route.post('/login', verifyToken, loginUserController)
route.put("/userUpdateById/:id", verifyToken, upload.single("image"), updateUserController);

route.post("/:userID/address",verifyToken, addAddressController);
route.put("/updateAddress/:id/address/:addressId", verifyToken, updateUserAddressController)

export default route;