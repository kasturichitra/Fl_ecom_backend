import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";

// Create Config
export const createConfigService = async (tenantID, configData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { configModelDB } = await getTenantModels(tenantID);

  // Check if a config already exists (usually one config per tenant)
  const existingConfig = await configModelDB.findOne({});
  throwIfTrue(existingConfig, "Config already exists for this tenant. Please use update instead.");

  const response = await configModelDB.create(configData);
  return response;
};

// Get All Configs
export const getAllConfigsService = async (tenantID, filters) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const {
    searchTerm,
    page = 1,
    limit = 10,
    sort, // "createdAt:desc"
  } = filters;

  const skip = (page - 1) * limit;

  const { configModelDB } = await getTenantModels(tenantID);
  const query = {};

  // Search term - searching across various fields
  if (searchTerm) {
    query.$or = [
      { "theme.mode": { $regex: searchTerm, $options: "i" } },
      { "email_settings.from_email": { $regex: searchTerm, $options: "i" } },
      { "seo.meta_title": { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Sorting logic
  const sortObj = buildSortObject(sort);
  const result = await configModelDB.aggregate([
    { $match: query },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const configs = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: configs,
  };
};

// Get Config By Id
export const getConfigByIdService = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Config ID is required");

  const { configModelDB } = await getTenantModels(tenantID);
  const response = await configModelDB.findById(id);

  throwIfTrue(!response, `Config not found with id: ${id}`);

  return response;
};

// Get Current Config (usually there's only one config per tenant)
export const getCurrentConfigService = async (tenantID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { configModelDB } = await getTenantModels(tenantID);
  const response = await configModelDB.findOne({});

  return response;
};

// Update Config
// Will create config if it doesn't exist
export const updateConfigService = async (tenantID, updateConfigData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { configModelDB } = await getTenantModels(tenantID);

  // If Id exists, update the config
  if (updateConfigData?._id) {
    const existingConfig = await configModelDB.findById(updateConfigData._id);
    throwIfTrue(!existingConfig, `Config not found with id: ${updateConfigData._id}`);

    const { _id, ...rest } = updateConfigData;

    const updated = await configModelDB.findByIdAndUpdate(updateConfigData._id, rest, {
      new: true,
      runValidators: true,
    });

    return updated;
  }
  // If Id doesn't exist, create a new config
  else if (!updateConfigData?._id) {
    const existingConfig = await configModelDB.findOne({});
    throwIfTrue(existingConfig, "Config already exists for this tenant. Please use update instead.");

    const response = await configModelDB.create(updateConfigData);
    return response;
  }
};

// Delete Config
export const deleteConfigService = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Config ID is required");

  const { configModelDB } = await getTenantModels(tenantID);

  const existingConfig = await configModelDB.findById(id);
  throwIfTrue(!existingConfig, `Config not found with id: ${id}`);

  const deleted = await configModelDB.findByIdAndDelete(id);

  return deleted;
};
