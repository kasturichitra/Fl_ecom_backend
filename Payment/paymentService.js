import axios from "axios";
import throwIfTrue from "../utils/throwIfTrue.js";
import validatePaymentDocuments from "./validations/validatePayment.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { v4 as uuidv4 } from "uuid";
import { updateOrderService } from "../Orders/orderService.js";
import { updateTransactionAnalytics } from "../lib/producers/updateTransactionAnalytics.js";

function extractPGGateways(response) {
  if (!response?.data || !Array.isArray(response.data)) return [];

  return response.data
    .filter((item) => item.type === "PG" && item.label === "PG")
    .flatMap((item) =>
      item.gateways.map((g) => ({
        gateway: g.gateway,
        gatewayCode: g.gatewayCode,
      })),
    );
}

async function processOrderPayment({
  tenantId,
  orderId,
  responseData,
  paymentStatusLabel, // "Paid" | "Failed"
}) {
  const paymentDoc = {
    payment_status: paymentStatusLabel,
    payment_method: responseData?.paymentMode,
    transaction_id: responseData?.transactionId,
    amount: responseData?.amount,
    currency: responseData?.currency || "INR",
    gateway: responseData?.gateway,
    gateway_code: responseData?.gatewayCode,
    key_id: responseData?.keyId || "Key Id",
    is_verified: true,
  };

  const { orderModelDB } = await getTenantModels(tenantId);

  const existingOrder = await orderModelDB.findOne({ order_id: orderId });
  throwIfTrue(!existingOrder, "Order doesn't exist with this id");

  const updatedOrder = await updateOrderService(tenantId, existingOrder._id, paymentDoc);

  return {
    order_id: updatedOrder?.order_id,
    paymentStatus: responseData?.status,
  };
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

  const { userModelDB, paymentTransactionsModelDB } = await getTenantModels(tenantId);

  let {
    gateway = "CASHFREE",
    gatewayCode = "CA103",
    keyId = "8a8fc592f455",
    flow = "FIXED_AMOUNT",
    amount,
    paymentMethod,
    redirectUrl,
    userId,
    referenceId, // Id of transaction created along with order
  } = payload;

  amount = Number(amount);

  const existingUser = await userModelDB.findOne({
    user_id: userId,
    is_active: true,
  });

  throwIfTrue(!existingUser, `User doesn't exist with this id ${userId}`);

  console.log("Reference Id in initiate payument order service ======>", referenceId);

  // Check for the transaction with referenceId and also check it's status
  const existingTransaction = await paymentTransactionsModelDB.findOne({
    transaction_reference_id: referenceId,
  });
  throwIfTrue(!existingTransaction, "Invalid reference Id");

  throwIfTrue(existingTransaction?.payment_status?.toLowerCase() !== "pending", "Payment already initiated");

  const sendablePayload = {
    referenceId,
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

  let responseData = null;

  const { orderModelDB } = await getTenantModels(tenantId);

  const existingOrder = await orderModelDB.findOne({ order_id: orderId });
  throwIfTrue(!existingOrder, "Order doesn't exist with this id");

  if (
    existingOrder?.payment_status?.toLowerCase() === "failed" ||
    existingOrder?.payment_status?.toLowerCase() === "successful"
  ) {
    return {
      order_id: orderId,
      paymentStatus: existingOrder?.payment_status,
    };
  }

  try {
    const response = await axios.get(`${process.env.PAYMENT_STATUS_URL}/${endpoint}`);

    responseData = response?.data;

    console.log("Response Data is ===>>", responseData);

    /**
     Response Data is ===>> {
    transactionId: 'TXN_9e45e054636d4f3b',
    amount: '40500.00',
    tenantId: 'tenant123',
    projectId: 'ecommerce_app',
    status: 'SUCCESS',
    gateway: 'CASHFREE',
    gatewayCode: 'CA103',
    paymentMode: 'CREDIT_CARD',
    paymentType: 'NORMAL_CREDIT_CARD',
    paymentMethod: 'VISA'
    }
     */
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }

  const normalizedStatus = responseData?.status?.trim().toLowerCase();

  if (normalizedStatus === "success") {
    const mqPayload = {
      eventId: responseData?.transactionId,
      tenantId: responseData?.tenantId || tenantId,
      gateway: responseData?.gateway,
      gatewayCode: responseData?.gatewayCode,
      keyId: responseData?.keyId || `${Date.now()}_${uuidv4().slice(-4)}`,
      paymentMode: responseData?.paymentMode,
      totalAmount: responseData?.amount,
      status: "success",
    };

    updateTransactionAnalytics(mqPayload);
    return await processOrderPayment({
      tenantId,
      orderId,
      responseData,
      paymentStatusLabel: "Paid",
    });
  }

  if (normalizedStatus === "failed") {
    const mqPayload = {
      eventId: responseData?.transactionId,
      tenantId: responseData?.tenantId,
      gateway: responseData?.gateway,
      gatewayCode: responseData?.gatewayCode,
      keyId: responseData?.keyId || `${Date.now()}_${uuidv4().slice(-4)}`,
      paymentMode: responseData?.paymentMode,
      totalAmount: responseData?.amount,
      status: "failed",
    };

    updateTransactionAnalytics(mqPayload);

    return await processOrderPayment({
      tenantId,
      orderId,
      responseData,
      paymentStatusLabel: "Failed",
    });
  }

  return {
    paymentStatus: responseData?.status,
  };
};
