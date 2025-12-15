import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController, verifyOtpController } from "./authController.js";

const route = Router();

// Auth
route.post("/register", registerUserController);
route.post("/login", loginUserController);
route.post("/logout", logoutUserController);
route.post("/verify-otp", verifyOtpController);

export default route;
