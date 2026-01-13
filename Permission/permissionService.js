import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getAllPermissionsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { permissionModelDB } = await getTenantModels(tenantId);

  const permissions = await permissionModelDB.find();

  return permissions;
};
