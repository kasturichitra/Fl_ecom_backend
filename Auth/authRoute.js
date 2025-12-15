import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController } from "./authController.js";

const route = Router();

// Auth
route.post("/register", registerUserController);
route.post("/login", loginUserController);
route.post("/logout", logoutUserController);

export default route;
