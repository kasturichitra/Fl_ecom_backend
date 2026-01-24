import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const createThemeService = async (tenantId, themeData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { themeModelDB } = await getTenantModels(tenantId);

  // Check if template_id already exists
  const existingTheme = await themeModelDB.findOne({
    template_id: themeData.template_id,
  });

  if (existingTheme) {
    throw new Error("Theme with this template_id already exists");
  }

  const theme = new themeModelDB(themeData);
  await theme.save();

  return theme;
};

export const getAllThemeService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { themeModelDB } = await getTenantModels(tenantId);

  const theme = await themeModelDB.find({});

  return theme;
};

export const getByThemeService = async (tenantId, template_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { themeModelDB } = await getTenantModels(tenantId);

  const theme = await themeModelDB.findOne({
    template_id,
  });

  return theme;
};



export const updateThemeService = async (tenantId, template_id, themeData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { themeModelDB } = await getTenantModels(tenantId);

  const theme = await themeModelDB.findOneAndUpdate(
    { template_id },
    themeData,
    { new: true }
  );

  return theme;
};