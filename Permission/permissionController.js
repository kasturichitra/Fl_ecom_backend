import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllPermissionsService } from "./permissionService.js";

export const getAllPermissionsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const response = await getAllPermissionsService(tenantId, filters);
    res.status(200).json(
      successResponse("Permissions fetched successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
