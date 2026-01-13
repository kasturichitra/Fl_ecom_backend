import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createRoleService,
  deleteRoleService,
  getAllRolesService,
  getRoleByIdService,
  updateRoleService,
} from "./roleService.js";

export const createRoleController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const payload = req.body;

    const response = await createRoleService(tenantId, payload);
    res.status(201).json(
      successResponse("Role created successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllRolesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const { totalCount, page, limit, totalPages, data } = await getAllRolesService(tenantId, filters);

    res.status(200).json(successResponse("Roles fetched successfully", { data, totalCount, page, limit, totalPages }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getRoleByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const id = req.params.id;

    const response = await getRoleByIdService(tenantId, id);
    res.status(200).json(successResponse("Role fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateRoleController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const id = req.params.id;
    const payload = req.body;

    const response = await updateRoleService(tenantId, id, payload);
    res.status(200).json(successResponse("Role updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const deleteRoleController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const id = req.params.id;

    const response = await deleteRoleService(tenantId, id);
    res.status(200).json(successResponse("Role deleted successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
