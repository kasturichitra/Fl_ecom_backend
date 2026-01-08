import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllPaymentGatewaysService } from "./paymentService.js";

export const getAllPaymentGatewaysController = async (req, res) => {
  try {
    const response = await getAllPaymentGatewaysService();
    res.status(200).json(successResponse("Payment gateways fetched successfully", {
      data: response
    }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
