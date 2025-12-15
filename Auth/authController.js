import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { loginUserService, registerUserService } from "./authService.js";

export const registerUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { username, email, phone_number, password } = req.body;

    if (!username || !email || !phone_number || !password)
      return res.status(400).json({ status: "failed", message: "All fields are required" });

    const user = await registerUserService(tenantId, username, email, password, phone_number);

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
