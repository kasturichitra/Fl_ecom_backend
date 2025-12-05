import throwIfTrue from "../utils/throwIfTrue.js";
import ConfigModel from "./configModel.js";
import { buildSortObject } from "../utils/buildSortObject.js";

// Create Config
export const createConfigService = async (tenantID, configData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const configModelDB = await ConfigModel(tenantID);

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

  const configModelDB = await ConfigModel(tenantID);
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
  const configs = await configModelDB.find(query).sort(sortObj).skip(skip).limit(Number(limit));

  const totalCount = await configModelDB.countDocuments(query);

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

  const configModelDB = await ConfigModel(tenantID);
  const response = await configModelDB.findById(id);

  throwIfTrue(!response, `Config not found with id: ${id}`);

  return response;
};

// Get Current Config (usually there's only one config per tenant)
export const getCurrentConfigService = async (tenantID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const configModelDB = await ConfigModel(tenantID);
  const response = await configModelDB.findOne({});

  return response;
};

// Update Config
export const updateConfigService = async (tenantID, id, updateConfigData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Config ID is required");

  const configModelDB = await ConfigModel(tenantID);

  const existingConfig = await configModelDB.findById(id);
  throwIfTrue(!existingConfig, `Config not found with id: ${id}`);

  const updated = await configModelDB.findByIdAndUpdate(id, updateConfigData, {
    new: true,
    runValidators: true,
  });

  return updated;
};

// Delete Config
export const deleteConfigService = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Config ID is required");

  const configModelDB = await ConfigModel(tenantID);

  const existingConfig = await configModelDB.findById(id);
  throwIfTrue(!existingConfig, `Config not found with id: ${id}`);

  const deleted = await configModelDB.findByIdAndDelete(id);

  return deleted;
};
