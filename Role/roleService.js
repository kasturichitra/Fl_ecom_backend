import mongoose from "mongoose";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const createRoleService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { roleModelDB, permissionModelDB } = await getTenantModels(tenantId);

  throwIfTrue(!payload?.name, "A Role Name is required");
  throwIfTrue(
    !payload?.permissions || !Array.isArray(payload?.permissions) || !payload?.permissions?.length,
    "Permissions shall be valid array"
  );

  const existingRole = await roleModelDB.findOne({
    name: payload?.name?.trim().toLowerCase(),
  });
  throwIfTrue(existingRole, "A role with similar name already exists");

  for (let perm of payload?.permissions ?? []) {
    throwIfTrue(!mongoose.Types.ObjectId.isValid(perm), "Permission id is not valid mongo id");
    perm = new mongoose.Types.ObjectId(perm);

    const existingPermission = await permissionModelDB.findById(perm);
    throwIfTrue(!existingPermission, "A permission with this id does not exist");
  }

  const role = await roleModelDB.create(payload);
  return role;
};
