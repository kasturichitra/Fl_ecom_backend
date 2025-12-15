import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { loginUserService, registerUserService } from "./authService.js";

export const registerUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const data = req.body;

    const user = await registerUserService(tenantId, data);

    generateTokenAndSetCookie(res, "rjhbekjcfnorebojerlbsour");

    res.status(201).json(successResponse("User registered successfully", { data: user }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const loginUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { email, password } = req.body;

    const userData = await loginUserService(tenantId, email, password);
    res.status(200).json(successResponse("Login successful", { data: userData }));
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
