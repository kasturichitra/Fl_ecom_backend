import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getAllPermissionsService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { permissionModelDB } = await getTenantModels(tenantId);

  const permissions = await permissionModelDB.aggregate([
    {
      $group: {
        _id: "$category",
        permissions: {
          $push: {
            _id: "$_id",
            key: "$key",
            description: "$description",
          },
        },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        permissions: 1,
        total: 1,
      },
    },
  ]);

  return permissions;
};
