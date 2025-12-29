import { Router } from "express";
import verifyTokenOptional from "../utils/verifyTokenOptional.js";
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
import rateLimiter from "../lib/redis/rateLimiter.js";

const route = Router();

// Auth
route.post(
  "/register",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "register-user",
  }),
  registerUserController
);

route.post(
  "/login",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "login-user",
  }),
  loginUserController
);

route.post(
  "/logout",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "logout-user",
  }),
  logoutUserController
);

route.post(
  "/verify-otp",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "verify-otp",
  }),
  verifyOtpController
);

route.post(
  "/resend-otp",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "resend-otp",
  }),
  resendOtpController
);

route.post(
  "/forgot-password",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "forgot-password",
  }),
  forgotPasswordController
);

route.post(
  "/verify-forgot-otp",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "verify-forgot-otp",
  }),
  verifyForgotOtpController
);

route.post(
  "/reset-password",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "reset-password",
  }),
  resetPasswordController
);

route.get(
  "/me",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-me",
  }),
  verifyTokenOptional,
  getMeController
);

export default route;
