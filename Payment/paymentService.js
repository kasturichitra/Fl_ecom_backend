import axios from "axios";
import throwIfTrue from "../utils/throwIfTrue.js";
import validatePaymentDocuments from "./validations/validatePayment.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { v4 as uuidv4 } from "uuid";
import { updateOrderService } from "../Orders/orderService.js";

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
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const registerPaymentDocumentsService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { gateway, gatewayCode, gatewayKey, gatewaySecret } = payload;

  const defaultPayload = {
    projectId: process.env.PROJECT_ID || "ecommerce_app",
    tenantId,
  };

  const sendablePayload = {
    ...defaultPayload,
    gateway,
    gatewayCode,
    gatewayKey,
    gatewaySecret,
  };

  const endpoint = ``;

  const { isValid, message } = validatePaymentDocuments(sendablePayload);
  throwIfTrue(!isValid, message);

  try {
    const response = await axios.post(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`, sendablePayload);

    return response?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const getPaymentDocumentsService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const projectId = process.env.PROJECT_ID || "ecommerce_app";
  const endpoint = `${projectId}/${tenantId}`;

  try {
    const response = await axios.get(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`);

    return response?.data?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const getPaymentDocumentByKeyIdService = async (tenantId, keyId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!keyId, "Key Id is required");

  const endpoint = `${keyId}`;

  try {
    const response = await axios.get(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`);

    return response?.data?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const updatePaymentDocumentService = async (tenantId, keyId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { gateway, gatewayCode, gatewayKey, gatewaySecret } = payload;

  const sendablePayload = {
    gateway,
    gatewayCode,
    gatewayKey,
    gatewaySecret,
  };

  const { isValid, message } = validatePaymentDocuments(sendablePayload);
  throwIfTrue(!isValid, message);

  const endpoint = `${keyId}`;

  try {
    const response = await axios.put(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`, sendablePayload);

    return response?.data?.data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const deletePaymentDocumentService = async (tenantId, keyId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!keyId, "Key Id is required");

  const endpoint = `${keyId}`;

  try {
    const response = await axios.delete(`${process.env.PAYMENT_REGISTRATION_URL}/${endpoint}`);

    return response?.data?.message;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const initiatePaymentOrderService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { userModelDB } = await getTenantModels(tenantId);

  let {
    gateway = "CASHFREE",
    gatewayCode = "CA103",
    keyId = "8a8fc592f455",
    flow = "FIXED_AMOUNT",
    amount,
    paymentMethod,
    redirectUrl,
    userId,
    orderId,
  } = payload;

  amount = Number(amount);

  const existingUser = await userModelDB.findOne({
    _id: userId,
    is_active: true,
  });
  throwIfTrue(!existingUser, "User doesn't exist with this id");

  console.log("Order Id in initiate payument order service ======>", orderId);

  const sendablePayload = {
    referenceId: orderId,
    projectId: process.env.PROJECT_ID || "ecommerce_app",
    tenantId,
    flow,
    amount,
    gateway,
    gatewayCode,
    keyId,
    paymentMethod,
    redirectURL: redirectUrl,
    metadata: {
      userId,
    },
  };

  console.log("sendablePayload ===>>", sendablePayload);

  try {
    const response = await axios.post(`${process.env.PAYMENT_INITIATE_URL}`, sendablePayload);

    const data = response?.data?.data;

    return data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const getPaymentStatusService = async (tenantId, orderId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderId, "Order ID is required");

  const endpoint = `?referenceId=${orderId}`;

  try {
    const response = await axios.get(`${process.env.PAYMENT_STATUS_URL}/${endpoint}`);

    const responseData = response?.data;

    console.log("Response Data is ===>>", responseData);

    if (responseData?.paymentStatus.trim().toLowerCase() === "success") {
      const paymentDoc = {
        payment_status: "Paid",
        payment_method: responseData?.data?.paymentMode,
        transaction_id: responseData?.data?.transactionId,
        amount: responseData?.data?.amount,
        currency: responseData?.data?.currency || "INR",
        gateway: responseData?.data?.gateway,
        gateway_code: responseData?.data?.gatewayCode,
        key_id: responseData?.data?.keyId,
        is_verified: true,
      };

      const { orderModelDB } = await getTenantModels(tenantId);

      const existingOrder = await orderModelDB.findOne({
        order_id: orderId,
      });
      throwIfTrue(!existingOrder, "Order doesn't exist with this id");

      const response = await updateOrderService(tenantId, existingOrder?._id, paymentDoc);

      return {
        order_id: response?.order_id,
        paymentStatus: responseData?.paymentStatus,
      };
    }

    return {
      paymentStatus: responseData?.paymentStatus,
    };
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};
