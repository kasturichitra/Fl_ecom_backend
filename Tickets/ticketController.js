import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { createTicketService, getAllTicketsService } from "./ticketService.js";

export const createTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    let payload = req.body;

    payload = {
      ...payload,
      raised_by: req.user._id.toString(),
      user_email: req.user.email,
    };

    console.log("payload", payload);
    const response = await createTicketService(tenantId, payload);

    res.status(201).json(successResponse("Ticket created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllTicketsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const filters = req.query;

    const response = await getAllTicketsService(tenantId, filters);

    res.status(200).json(successResponse("Tickets fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
