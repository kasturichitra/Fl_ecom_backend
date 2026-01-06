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

  const { isValid, message } = validateTicketCreate(payload);
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
      { keywords: { $regex: searchTerm, $options: "i" } },
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

export const getTicketByIdService = async (tenantId, ticketId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { ticketModelDB } = await getTenantModels(tenantId);

  const ticket = await ticketModelDB.aggregate([
    /* ---------------------------------- */
    /* 1️⃣ Match Ticket                    */
    /* ---------------------------------- */
    {
      $match: { ticket_id: ticketId },
    },

    /* ---------------------------------- */
    /* 2️⃣ Raised By User                  */
    /* ---------------------------------- */
    {
      $lookup: {
        from: "users",
        localField: "raised_by",
        foreignField: "_id",
        as: "raised_by",
      },
    },
    {
      $unwind: {
        path: "$raised_by",
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ---------------------------------- */
    /* 3️⃣ FAQ Question                    */
    /* ---------------------------------- */
    {
      $lookup: {
        from: "faqs",
        localField: "faq_question_id",
        foreignField: "question_id",
        as: "faq_question",
      },
    },
    {
      $unwind: {
        path: "$faq_question",
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ---------------------------------- */
    /* 4️⃣ FAQ Path (SORTED by createdAt)  */
    /* ---------------------------------- */
    {
      $lookup: {
        from: "faqs",
        let: { faqPathIds: "$faq_path" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$question_id", "$$faqPathIds"] },
            },
          },
          {
            $sort: { createdAt: 1 }, // ✅ Earliest first
          },
        ],
        as: "faq_path",
      },
    },

    /* ---------------------------------- */
    /* 5️⃣ Projection (Security)           */
    /* ---------------------------------- */
    {
      $project: {
        "raised_by.password": 0,
        "raised_by.__v": 0,
      },
    },
  ]);

  return ticket[0] || null;
};

/*
    Example JSON
    {
        assigned_to: "User-001",
    }
*/
export const assignTicketService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { ticketModelDB } = await getTenantModels(tenantId);

  const existingTicket = await ticketModelDB.findOne({ ticket_id: payload.ticket_id });
  throwIfTrue(!existingTicket, "Ticket not found");

  existingTicket.assigned_to = payload.assigned_to;
  existingTicket.status = "assigned";
  existingTicket.assigned_at = new Date();

  await existingTicket.save();
  return existingTicket;
};

/*
  Example JSON
  {
    "resolved_by": "User-001"
  }
*/

export const resolveTicketService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { ticketModelDB } = await getTenantModels(tenantId);

  const existingTicket = await ticketModelDB.findOne({ ticket_id: payload.ticket_id });
  throwIfTrue(!existingTicket, "Ticket not found");

  existingTicket.resolved_by = payload.resolved_by;
  existingTicket.status = "resolved";
  existingTicket.resolved_at = new Date();

  await existingTicket.save();
  return existingTicket;
};
