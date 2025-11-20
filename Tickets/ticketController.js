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

    return res.status(201).json({
      status: "success",
      message: "Ticket created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Ticket creation error:", error.message);
    return sendError(res, 500, error.message);
  }
};

// ---------------------- Get All Tickets ----------------------
export const getAllTicketsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");

    const response = await getAllTicketsService(tenantID);

    return res.status(200).json({
      status: "success",
      message: "Tickets fetched successfully",
      total: response.length,
      data: response,
    });
  } catch (error) {
    console.error("Get Ticket Error:", error.message);
    return sendError(res, 500, error.message);
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

    return res.status(200).json({
      status: "success",
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket update error:", error.message);
    return sendError(res, 500, error.message);
  }
};

