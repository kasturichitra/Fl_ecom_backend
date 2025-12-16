import { Router } from "express";
import {
  forgotPasswordController,
  getMeController,
  loginUserController,
  logoutUserController,
  registerUserController,
  resendOtpController,
  resetPasswordController,
  verifyForgotOtpController,
  verifyOtpController,
} from "./authController.js";

const route = Router();

// Auth
route.post("/register", registerUserController);
route.post("/login", loginUserController);
route.post("/logout", logoutUserController);
route.post("/verify-otp", verifyOtpController);
route.post("/resend-otp", resendOtpController);
route.post("/forgot-password", forgotPasswordController);
route.post("/verify-forgot-otp", verifyForgotOtpController);
route.post("/reset-password", resetPasswordController);
route.get("/me", getMeController);

export default route;
