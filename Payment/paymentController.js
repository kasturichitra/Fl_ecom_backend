import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  deletePaymentDocumentService,
  getAllPaymentGatewaysService,
  getPaymentDocumentByKeyIdService,
  getPaymentDocumentsService,
  initiatePaymentOrderService,
  registerPaymentDocumentsService,
  updatePaymentDocumentService,
} from "./paymentService.js";

export const getAllPaymentGatewaysController = async (req, res) => {
  try {
    const response = await getAllPaymentGatewaysService();
    res.status(200).json(
      successResponse("Payment gateways fetched successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const registerPaymentDocumentsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const payload = req.body;

    const response = await registerPaymentDocumentsService(tenantId, payload);

    res.status(200).json(
      successResponse("Payment documents registered successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getPaymentDocumentsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const response = await getPaymentDocumentsService(tenantId);

    res.status(200).json(
      successResponse("Payment documents fetched successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getPaymentDocumentByKeyIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: keyId } = req.params;

    const response = await getPaymentDocumentByKeyIdService(tenantId, keyId);

    res.status(200).json(
      successResponse("Payment document fetched successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updatePaymentDocumentController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: keyId } = req.params;
    const payload = req.body;

    const response = await updatePaymentDocumentService(tenantId, keyId, payload);

    res.status(200).json(
      successResponse("Payment document updated successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const deletePaymentDocumentController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: keyId } = req.params;

    const response = await deletePaymentDocumentService(tenantId, keyId);

    res.status(200).json(
      successResponse("Payment document deleted successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const initiatePaymentOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const payload = req.body;

    const response = await initiatePaymentOrderService(tenantId, payload);

    res.status(200).json(
      successResponse("Payment order initiated successfully", {
        data: response,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
