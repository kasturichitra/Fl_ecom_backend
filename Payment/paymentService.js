import axios from "axios";
import throwIfTrue from "../utils/throwIfTrue.js";

function extractPGGateways(response) {
  if (!response?.data || !Array.isArray(response.data)) return [];

  return response.data
    .filter((item) => item.type === "PG" && item.label === "PG")
    .flatMap((item) =>
      item.gateways.map((g) => ({
        gateway: g.gateway,
        gatewayCode: g.gatewayCode,
      }))
    );
}

export const getAllPaymentGatewaysService = async () => {
  const endpoint = `api/v1/maintainance/get-allgateways`;

  try {
    const response = await axios.get(`${process.env.SUPER_ADMIN_URL}/${endpoint}`);

    const result = extractPGGateways(response?.data);

    return result;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error.message}`);
  }
};

export const registerPaymentDocumentsService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { gateway, gatewayCode, gatewayKey, gatewaySecret } = payload;

  const defaultPayload = {
    projectId: "ecommerce_app",
    tenantId,
  };

  const sendablePayload = {
    ...defaultPayload,
    gateway,
    gatewayCode,
    gatewayKey,
    gatewaySecret,
  };

  const endpoint = `api/payIn/keys`;

  try {
    const response = await axios.post(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`, sendablePayload);

    return response?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error.message}`);
  }
};

export const getPaymentDocumentsService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const projectId = "ecommerce_app";
  const endpoint = `api/payIn/keys/${projectId}/${tenantId}`;

  try {
    const response = await axios.get(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`);

    return response?.data?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error.message}`);
  }
};
