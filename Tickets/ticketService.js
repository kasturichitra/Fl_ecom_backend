import { getTenantModels } from "../lib/tenantModelsCache.js";
import validateTicketCreate from "./validations/validateTicketCreate.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";

/*
    Example JSON 
    {
        user_id: "User-001",
        user_email: "example@example.com",
        faq_question_id: "Question-001",
        faq_path: "",
        message: "Nice",
    }
*/
export const createTicketService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { faqModelDB, ticketModelDB } = await getTenantModels(tenantId);
  const existingFaq = await faqModelDB.findOne({ question_id: payload.faq_question_id });
  throwIfTrue(!existingFaq, "FAQ not found");

  const ticket_id = `${existingFaq.question_id}_${Date.now()}`;

  payload = { ...payload, ticket_id };

  const { isValid, message } = await validateTicketCreate(payload);
  throwIfTrue(!isValid, message);

  const createdTicket = await ticketModelDB.create(payload);
  return createdTicket;
};

export const getAllTicketsService = async (tenantId, filters) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { page = 1, limit = 10, searchTerm, sort, status, from, to } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let query = {};

  if (searchTerm) {
    query.$or = [
      { ticket_id: { $regex: searchTerm, $options: "i" } },
      { message: { $regex: searchTerm, $options: "i" } },
      { faq_question_id: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (status) query.status = status;

  if (from) query.createdAt = { $gte: new Date(from) };
  if (to) query.createdAt = { $lte: new Date(to) };

  if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };

  const sortObj = buildSortObject(sort);
  const skip = (page - 1) * limit;

  const { ticketModelDB } = await getTenantModels(tenantId);
  const tickets = await ticketModelDB.find(query).sort(sortObj).skip(skip).limit(limit).lean();
  return tickets;
};
