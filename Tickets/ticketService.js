import throwIfTrue from "../utils/throwIfTrue.js";
import TicketModel from "./ticketModel.js";

// ----------------- CREATE TICKET -----------------
export const createTicketService = async (tenantID, ticketData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const ticketDB = await TicketModel(tenantID);
  return ticketDB.create(ticketData);
};

// ----------------- GET ALL TICKETS -----------------
export const getAllTicketsService = async (tenantID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const ticketDB = await TicketModel(tenantID);
  return ticketDB.find().sort({ createdAt: -1 });
};

// ----------------- UPDATE TICKET -----------------
export const updateTicketService = async (tenantID, ticketId, updateData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const ticketDB = await TicketModel(tenantID);

  return ticketDB.findOneAndUpdate(
    { ticket_id: ticketId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

