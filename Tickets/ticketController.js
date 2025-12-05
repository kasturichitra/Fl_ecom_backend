import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createTicketService,
  getAllTicketsService,
  updateTicketService,
} from "./ticketService.js";

// Common function for sending error response
const sendError = (res, code, msg) =>
  res.status(code).json({ status: "failed", message: msg });

// ---------------------- Create Ticket ----------------------
export const createTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return sendError(res, 400, "Tenant ID is required");

    const { user_id, order_id, product_id, issue_type, subject, description, attachments, priority } = req.body;

    const ticketData = {
      ticket_id: `TCKT-${Date.now()}`,
      user_id,
      order_id,
      product_id,
      issue_type,
      subject,
      description,
      attachments,
      priority,
    };

    const response = await createTicketService(tenantID, ticketData);
    res.status(201).json(successResponse("Ticket created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// ---------------------- Get All Tickets ----------------------
export const getAllTicketsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");

    const response = await getAllTicketsService(tenantID);
    res.status(200).json(successResponse("Tickets fetched successfully", { total: response.length, data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// ---------------------- Update Ticket ----------------------
export const updateTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;
    const updateData = req.body;

    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");
    if (!id) return sendError(res, 400, "Ticket ID is required in params");
    if (!updateData || !Object.keys(updateData).length)
      return sendError(res, 400, "Update data is required");

    const updatedTicket = await updateTicketService(tenantID, id, updateData);

    if (!updatedTicket)
      return sendError(res, 404, "Ticket not found");
    res.status(200).json(successResponse("Ticket updated successfully", { data: updatedTicket }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

