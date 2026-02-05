import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getByCustomerInfoService = async (tenantId, mobile_number) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(
    !mobile_number || typeof mobile_number !== "string" || mobile_number.length !== 10,
    "Mobile number is required and should be 10 digits long",
  );
  const { offlineCustomerModelDB } = await getTenantModels(tenantId);

  // Simulate fetching customer info based on mobile number
  const customerInfo = await offlineCustomerModelDB.find({ mobile_number });

  return customerInfo;
};
