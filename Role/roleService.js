import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const createRoleService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { roleModelDB, permissionModelDB } = await getTenantModels(tenantId);

  const existingRole = await roleModelDB.findOne({
    name: payload?.name?.trim().toLowerCase(),
  });
  throwIfTrue(existingRole, "A role with similar name already exists");

  for (const perm of payload?.permissions ?? []) {
    const existingPermission = await permissionModelDB.findOne({ _id: perm });
    throwIfTrue(!existingPermission, "A permission with this id does not exist");
  }

  const role = await roleModelDB.create(payload);
  return role;
};
