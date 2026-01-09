import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  addAddressService,
  deleteUserAccountService,
  deleteUserAddressService,
  employeCreateService,
  getAllRolesService,
  getAllUsersService,
  getUserByIdService,
  storeFcmTokenService,
  updateUserAddressService,
  updateUserService
} from "./userService.js";

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

export const getAllRolesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const roles = await getAllRolesService(tenantId);
    res.status(200).json(successResponse("Roles fetched successfully", { data: roles }));
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

    if (!tenantId || !user_id) return res.status(400).json(errorResponse("Tenant ID & User ID required"));

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

export const deleteUserAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id, address_id } = req.params;

    const updatedUser = await deleteUserAddressService(tenantId, id, address_id);

    res.status(200).json(successResponse("Address deleted successfully", { data: updatedUser }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const employeCreateController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { image_base64, ...rest } = req.body;

    let fileBuffer = null;

    if (image_base64) {
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const response = await employeCreateService(tenantId, rest, fileBuffer);
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
export const deleteUserAccountController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    const response = await deleteUserAccountService(tenantId, id);
    res.status(200).json(successResponse("User account deleted successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};






