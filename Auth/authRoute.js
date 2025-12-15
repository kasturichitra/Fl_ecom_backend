import { Router } from "express";
import { loginUserController, registerUserController } from "./authController.js";

const route = Router();

// Auth
route.post("/register", registerUserController);
route.post("/login", loginUserController);

export default route;
