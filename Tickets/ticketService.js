import { getTenantModels } from "../lib/tenantModelsCache.js";
import validateTicketCreate from "./validations/validateTicketCreate.js";
import throwIfTrue from "../utils/throwIfTrue.js";

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
