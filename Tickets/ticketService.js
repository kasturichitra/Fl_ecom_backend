


export const createTicketService=async()=>{

}










// import { generateTicketNumber } from "../utils/generateTicketId.js";
// import throwIfTrue from "../utils/throwIfTrue.js";
// import TicketModel from "./ticketModel.js";

// // ----------------- CREATE TICKET -----------------
// export const createTicketService = async (tenantID, ticketData) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!ticketData.user_id, "User ID is required");
//   throwIfTrue(!ticketData.issue_type, "Issue Type is required");
//   throwIfTrue(!ticketData.title, "Title is required");
//   throwIfTrue(!ticketData.description, "Description is required");
//   const ticketDB = await TicketModel(tenantID);

//   const ticketNumber = await generateTicketNumber(ticketDB);

//   ticketData.ticket_number = ticketNumber;
//   ticketData.status = "Open"
//   ticketData.priority = ticketData.priority || "Medium"

//   console.log(ticketData, 'cjecking the ticket data');
//   return ticketDB.create(ticketData);
// };

// // ----------------- ADD MESSAGE TO TICKET -----------------
// export const addMessageToTicketService = async (tenantID, ticket_number, messageData) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!ticket_number, "Ticket Number is required");

//   const Ticket = await TicketModel(tenantID);

//   let updatedTicket = null;

//   if (!updatedTicket) {
//     updatedTicket = await Ticket.findByIdAndUpdate(
//       ticket_number,
//       { $push: { conversation: messageData } },
//       { new: true }
//     );
//   }

//   if (!updatedTicket) {
//     throw new Error("Ticket not found");
//   }

//   return updatedTicket;
// };

// // ----------------- GET ALL TICKETS -----------------
// export const getAllTicketsService = async (tenantID, query = {}) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");

//   const ticketDB = await TicketModel(tenantID);
//   return ticketDB.find(query).sort({ createdAt: -1 });
// };

// // ----------------- GET TICKET BY ID -----------------
// export const getTicketByIdService = async (tenantID, ticket_number) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!ticket_number, "Ticket Number is required");

//   const ticketDB = await TicketModel(tenantID); 

//   // Try to find by _id first, if fails or not found, try by ticket_number
//   // if (ticket_number.match(/^[0-9a-fA-F]{24}$/)) {
//   //   const ticket = await ticketDB.findById(ticket_number);
//   //   if (ticket) return ticket;
//   // }

//   return ticketDB.findOne({ ticket_number: ticket_number });
// };

// // ----------------- UPDATE TICKET -----------------
// export const updateTicketService = async (tenantID, ticket_number, updateData) => {
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!ticketId, "Ticket ID is required");

//   const ticketDB = await TicketModel(tenantID);

//   // Check if it's a valid ObjectId
//   if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
//     return ticketDB.findByIdAndUpdate(
//       ticketId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );
//   } else {
//     return ticketDB.findOneAndUpdate(
//       { ticket_number: ticketId },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );
//   }
// };

