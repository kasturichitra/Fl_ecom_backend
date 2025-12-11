import { successResponse, errorResponse } from "../utils/responseHandler.js";
import {
  addAddressService,
  employeCreateService,
  getAllUsersService,
  getUserByIdService,
  loginUserService,
  registerUserService,
  storeFcmTokenService,
  updateUserAddressService,
  updateUserService,
} from "./userService.js";

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

export const getAllUsersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const { totalCount, currentPage, totalPages, limit, data } = await getAllUsersService(tenantId, filters);
    res
      .status(200)
      .json(successResponse("Users fetched successfully", { totalCount, currentPage, totalPages, limit, data }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const user = await getUserByIdService(tenantId, id);
    res.status(200).json(successResponse("User fetched successfully", { data: user }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const updateUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    let updateData = { ...req.body };
    if (req.body.address) {
      updateData.address = JSON.parse(req.body.address);
    }

    if (req.file) updateData.image = req.file.path;

    const updatedUser = await updateUserService(tenantId, id, updateData);
    res.status(200).json(successResponse("User updated successfully", { data: updatedUser }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const addAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { user_id } = req.params;

    if (!tenantId || !user_id)
      return res.status(400).json(errorResponse("Tenant ID & User ID required"));

    const updatedUser = await addAddressService(tenantId, user_id, req.body);
    res.status(200).json(successResponse("Address added successfully", { data: updatedUser }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateUserAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id, address_id } = req.params;

    const updatedUser = await updateUserAddressService(tenantId, id, address_id, req.body);

    res.status(200).json(successResponse("Address updated successfully", { data: updatedUser }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};


export const employeCreateController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await employeCreateService(tenantId, req.body);
    res.status(201).json(successResponse("Employee created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const storeFcmTokenController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;
    const { fcm_token } = req.body;
    const response = await storeFcmTokenService(tenantId, user_id, fcm_token);
    res.status(200).json(successResponse("Fcm token stored successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
