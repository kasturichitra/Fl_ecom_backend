import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  assignTicketService,
  createTicketService,
  getAllTicketsService,
  getTicketByIdService,
  resolveTicketService,
} from "./ticketService.js";

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

export const getTicketByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const response = await getTicketByIdService(tenantId, ticket_id);

    res.status(200).json(successResponse("Ticket fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const assignTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const payload = {
      ...req.body,
      ticket_id,
    };

    const response = await assignTicketService(tenantId, payload);

    res.status(200).json(successResponse("Ticket assigned successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const resolveTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const payload = {
      ...req.body,
      ticket_id,
    };

    const response = await resolveTicketService(tenantId, payload);

    res.status(200).json(successResponse("Ticket resolved successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
