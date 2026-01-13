import mongoose from "mongoose";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";

export const createRoleService = async (tenantId, payload = {}) => {
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

export const getAllRolesService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { is_system_role, page = 1, limit = 10, sort = "createdAt:desc" } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  if (is_system_role === "true") query.is_system_role = true;
  if (is_system_role === "false") query.is_system_role = false;

  const { roleModelDB } = await getTenantModels(tenantId);

  const sortObj = buildSortObject(sort);

  const [result] = await roleModelDB.aggregate([
    { $match: query },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const totalCount = result.totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: result.data,
  };
};

export const updateRoleService = async (tenantId, id, payload = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!id, "Role ID is required");

  const { roleModelDB, permissionModelDB } = await getTenantModels(tenantId);

  const existingRole = await roleModelDB.findById(id);
  throwIfTrue(!existingRole, "A role with this id does not exist");

  for (let perm of payload?.permissions ?? []) {
    throwIfTrue(!mongoose.Types.ObjectId.isValid(perm), "Permission id is not valid mongo id");
    perm = new mongoose.Types.ObjectId(perm);

    const existingPermission = await permissionModelDB.findById(perm);
    throwIfTrue(!existingPermission, "A permission with this id does not exist");
  }

  const updatedRole = await roleModelDB.findByIdAndUpdate(id, payload, { new: true });
  return updatedRole;
};

export const deleteRoleService = async (tenantId, roleId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!roleId, "Role ID is required");

  const { roleModelDB } = await getTenantModels(tenantId);

  const existingRole = await roleModelDB.findById(roleId);
  throwIfTrue(!existingRole, "A role with this id does not exist");

  throwIfTrue(existingRole.is_system_role, "System role can't be deleted");

  const deletedRole = await roleModelDB.findByIdAndDelete(roleId);
  return deletedRole;
};
