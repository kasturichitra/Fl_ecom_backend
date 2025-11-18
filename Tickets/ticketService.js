import TicketModel from "./ticketModel.js";

export const createTicketService = async (tenantID, ticketData) => {
  if (!tenantID) throw new Error("Tenant ID is required");

  const ticketModelDB = await TicketModel(tenantID);
  const response = await ticketModelDB.create(ticketData);

  return response;
};

export const getAllTicketsService = async (tenantID) => {
  if (!tenantID) throw new Error("Tenant ID is required");

  const ticketModelDB = await TicketModel(tenantID);

  const response = await ticketModelDB.find().sort({ createdAt: -1 });

  return response;
};

export const updateTicketService = async (tenantID, ticketId, updateData) => {
  if (!tenantID) throw new Error("Tenant ID is required");
  if (!ticketId) throw new Error("Ticket ID is required");

  const ticketModelDB = await TicketModel(tenantID);

  const updatedTicket = await ticketModelDB.findOneAndUpdate(
    { ticket_id: ticketId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedTicket;
};
