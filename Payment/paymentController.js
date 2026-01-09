import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllPaymentGatewaysService, getPaymentDocumentsService, registerPaymentDocumentsService } from "./paymentService.js";

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
