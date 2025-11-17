import { createTicketServices, getTicketServices, updateTicketServices } from "./ticketService.js";

export const createTicketController = async (req, res) => {
    try {
        const tenantID = req.headers["x-tenant-id"];
        if (!tenantID)
            return res.status(400).json({ status: "failed", message: "Tenant ID is required" });

        const {
            user_ID,
            order_ID,
            product_ID,
            issue_type,
            subject,
            description,
            attachments,
            priority,
        } = req.body;

        // Auto-generate ticket_ID
        const ticket_ID = `TCKT-${Date.now()}`;

        const ticketData = {
            ticket_ID,
            user_ID,
            order_ID,
            product_ID,
            issue_type,
            subject,
            description,
            attachments,
            priority,

        };

        const response = await createTicketServices(tenantID, ticketData);

        res.status(201).json({
            status: "success",
            message: "Ticket created successfully",
            data: response,
        });
    } catch (error) {
        console.error("Ticket creation error:", error.message);
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
};



export const getTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];

    if (!tenantID) {
      return res.status(400).json({
        status: "failed",
        message: "Tenant ID is required in headers",
      });
    }

    const response = await getTicketServices(tenantID);

    res.status(200).json({
      status: "success",
      message: "Tickets fetched successfully",
      total: response.length,
      data: response,
    });
  } catch (error) {
    console.error("Get Ticket Error:", error.message);
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};



export const updateTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params; 
    const updateData = req.body;

    if (!tenantID) {
      return res.status(400).json({
        status: "failed",
        message: "Tenant ID is required in headers",
      });
    }

    if (!id) {
      return res.status(400).json({
        status: "failed",
        message: "Ticket ID is required in params",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Update data is required",
      });
    }

    const updatedTicket = await updateTicketServices(tenantID, id, updateData);

    if (!updatedTicket) {
      return res.status(404).json({
        status: "failed",
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket update error:", error.message);
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
