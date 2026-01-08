import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import validateTicketCreate from "./validations/validateTicketCreate.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { sendAdminNotification, sendUserNotification } from "../utils/notificationHelper.js";
import {
  sendEmailNotification,
  generateTicketEmailTemplate,
  generateTicketResolvedForUserEmail,
  generateTicketAssignedToEmployeeEmail,
  generateTicketAssignedToUserEmail,
} from "./utils/sendEmail.js";
import mongoose from "mongoose";
import { validateTicketUpdate } from "./validations/validateTicketUpdate.js";

/*
    Example JSON 
    {
        user_id: "User-001",
        user_email: "example@example.com",
        faq_question_id: "Question-001",
        faq_path: [
            "Question-001",
            "Question-002",
            "Question-003"
        ],
        message: "Nice",
        relevant_images: ["base64string1", "base64string2"]
    }
*/
export const createTicketService = async (tenantId, payload, relevantImagesBuffers) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { faqModelDB, ticketModelDB } = await getTenantModels(tenantId);
  const existingFaq = await faqModelDB.findOne({ question_id: payload.faq_question_id });
  throwIfTrue(!existingFaq, "FAQ not found");

  const ticket_id = `${existingFaq.question_id}_${Date.now()}`;

  payload = { ...payload, ticket_id };

  let existingTicket = null;

  // Block tickets from being duplicated
  if (payload.order_id) {
    existingTicket = await ticketModelDB.findOne({ order_id: payload.order_id, status: "pending" });
    throwIfTrue(
      existingTicket && existingTicket.faq_question_id === payload.faq_question_id,
      `A Pending ticket already exists for this order for the concern ${payload.faq_question_id}`
    );
    throwIfTrue(existingTicket.is_prohibited, `Raising a ticket for this concern is prohibited`);
  } else {
    existingTicket = await ticketModelDB.findOne({
      raised_by: user_id,
      faq_question_id: payload.faq_question_id,
      status: "pending",
    });
    throwIfTrue(
      existingTicket,
      `A Pending ticket already exists for this user for the concern ${payload.faq_question_id}`
    );
    throwIfTrue(existingTicket.is_prohibited, `Raising a ticket for this concern is prohibited`);
  }

  // -------------------------------
  // S3 Image Upload
  // -------------------------------
  if (relevantImagesBuffers && relevantImagesBuffers.length > 0) {
    const uploadPromises = relevantImagesBuffers.map((buffer, index) =>
      uploadImageVariants({
        fileBuffer: buffer,
        basePath: `${tenantId}/Tickets/${ticket_id}/relevant-${index}`,
      })
    );
    payload.relevant_images = await Promise.all(uploadPromises);
  }

  const { isValid, message } = validateTicketCreate(payload);
  throwIfTrue(!isValid, message);

  const createdTicket = await ticketModelDB.create(payload);

  // Send notifications and emails to admin in background (non-blocking)
  notifyAdminsInBackground(tenantId, {
    ticket_id: createdTicket.ticket_id,
    user_email: payload.user_email,
    faq_question_id: payload.faq_question_id,
    message: payload.message,
    relevant_images: payload.relevant_images || [],
  }).catch((err) => {
    console.error("Background notification failed:", err);
  });

  return createdTicket;
};

export const getAllTicketsService = async (tenantId, filters) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  let { page = 1, limit = 10, searchTerm, sort, status, from, to, assigned_to } = filters;

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
  if (assigned_to) {
    throwIfTrue(!mongoose.Types.ObjectId.isValid(assigned_to), "Invalid MongoDB ID for assigned_to");
    query.assigned_to = new mongoose.Types.ObjectId(assigned_to);
  }

  if (from) query.createdAt = { $gte: new Date(from) };
  if (to) query.createdAt = { $lte: new Date(to) };

  if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };

  const sortObj = buildSortObject(sort);
  const skip = (page - 1) * limit;

  const { ticketModelDB } = await getTenantModels(tenantId);
  const [result] = await ticketModelDB.aggregate([
    { $match: query },

    /* 🔹 Lookup resolved_by */
    {
      $lookup: {
        from: "users",
        localField: "resolved_by",
        foreignField: "_id",
        as: "resolved_by",
        pipeline: [{ $project: { username: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$resolved_by", preserveNullAndEmptyArrays: true } },

    {
      $facet: {
        data: [{ $sort: sortObj }, { $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const totalCount = result.totalCount[0]?.count || 0;

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    data: result.data,
  };
};

export const getTicketWithDetails = async (tenantId, matchQuery) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!matchQuery || Object.keys(matchQuery).length === 0, "Match query is required");

  const { ticketModelDB } = await getTenantModels(tenantId);

  const ticket = await ticketModelDB.aggregate([
    /* ---------------------------------- */
    /* 1️⃣ Match Ticket                    */
    /* ---------------------------------- */
    {
      $match: matchQuery,
    },

    {
      $sort: {
        createdAt: -1,
      },
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
    /* 3️⃣ Assigned To User                */
    /* ---------------------------------- */
    {
      $lookup: {
        from: "users",
        localField: "assigned_to",
        foreignField: "_id",
        as: "assigned_to",
      },
    },
    {
      $unwind: {
        path: "$assigned_to",
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ---------------------------------- */
    /* 4️⃣ Resolved By User                */
    /* ---------------------------------- */
    {
      $lookup: {
        from: "users",
        localField: "resolved_by",
        foreignField: "_id",
        as: "resolved_by",
      },
    },
    {
      $unwind: {
        path: "$resolved_by",
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ---------------------------------- */
    /* 5️⃣ FAQ Question                    */
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
    /* 6️⃣ FAQ Path (Sorted)               */
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
            $sort: { createdAt: 1 },
          },
        ],
        as: "faq_path",
      },
    },

    /* ---------------------------------- */
    /* 7️⃣ Projection (Security)           */
    /* ---------------------------------- */
    {
      $project: {
        "raised_by.password": 0,
        "raised_by.__v": 0,
        "assigned_to.password": 0,
        "assigned_to.__v": 0,
        "resolved_by.password": 0,
        "resolved_by.__v": 0,
      },
    },
  ]);

  return ticket[0] || null;
};

export const getTicketByIdService = async (tenantId, ticketId) => {
  return await getTicketWithDetails(tenantId, { ticket_id: ticketId });
};

export const getUserTicketForOrderService = async (tenantId, order_id) => {
  return await getTicketWithDetails(tenantId, { order_id });
};

/*
    Example JSON
    {
        assigned_to: "User-001",
    }
*/
export const assignTicketService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { ticketModelDB, userModelDB } = await getTenantModels(tenantId);

  const existingTicket = await ticketModelDB.findOne({
    ticket_id: payload.ticket_id,
  });

  throwIfTrue(!existingTicket, "Ticket not found");
  throwIfTrue(existingTicket.status !== "pending", "Ticket is not in pending state");

  const existingUser = await userModelDB.findOne({
    _id: payload.assigned_to,
  });

  throwIfTrue(!existingUser, "User not found");

  existingTicket.assigned_to = payload.assigned_to;
  existingTicket.status = "assigned";
  existingTicket.assigned_at = new Date();

  await existingTicket.save();

  // 🔥 populate AFTER save
  await existingTicket.populate("assigned_to raised_by");

  notifyUsersInBackground({
    tenantId,
    ticketData: existingTicket,
    user_id: existingTicket.assigned_to,
    templateFunction: generateTicketAssignedToEmployeeEmail,
    subject: "Support ticket has been assigned to you",
    message: `Ticket ${existingTicket.ticket_id} for ${existingTicket.faq_question_id} has been assigned to you`,
  }).catch((err) => {
    console.error("Background notification failed for generateTicketAssignedToEmployeeEmail:", err);
  });

  notifyUsersInBackground({
    tenantId,
    ticketData: existingTicket,
    user_id: existingTicket.raised_by,
    templateFunction: generateTicketAssignedToUserEmail,
    subject: "Your ticket has been assigned to customer care",
    message: `Ticket ${existingTicket.ticket_id} for ${existingTicket.faq_question_id} has been assigned to customer care and we will get back to you soon`,
  }).catch((err) => {
    console.error("Background notification failed for generateTicketAssignedToUserEmail:", err);
  });

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

  const { ticketModelDB, userModelDB } = await getTenantModels(tenantId);

  const existingTicket = await ticketModelDB.findOne({ ticket_id: payload.ticket_id });
  throwIfTrue(!existingTicket, "Ticket not found");

  const existingUser = await userModelDB.findOne({ _id: payload.resolved_by });
  throwIfTrue(!existingUser, "User not found");

  throwIfTrue(existingTicket.status === "resolved", "Ticket is already resolved");

  existingTicket.resolved_by = payload.resolved_by;
  existingTicket.status = "resolved";
  existingTicket.resolved_at = new Date();

  await existingTicket.save();

  await existingTicket.populate("assigned_to raised_by resolved_by");

  notifyUsersInBackground({
    tenantId,
    ticketData: existingTicket,
    user_id: existingTicket.raised_by,
    templateFunction: generateTicketResolvedForUserEmail,
    subject: "Support ticket has been resolved",
    message: `Ticket ${existingTicket.ticket_id} for ${existingTicket.faq_question_id} has been resolved`,
  }).catch((err) => {
    console.error("Background notification failed:", err);
  });

  return existingTicket;
};

export const updateTicketService = async (tenantId, ticketId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const { ticketModelDB } = await getTenantModels(tenantId);

  const existingTicket = await ticketModelDB.findOne({ ticket_id: ticketId });
  throwIfTrue(!existingTicket, "Ticket not found");

  const { isValid, message } = validateTicketUpdate(payload);
  throwIfTrue(!isValid, message);

  const updatedTicket = await ticketModelDB.findOneAndUpdate({ ticket_id: ticketId }, payload, {
    new: true,
  });

  return updatedTicket;
};

/**
 * Send notification and email to all admin users in background
 * This function runs asynchronously without blocking the main ticket creation
 */
const notifyAdminsInBackground = async (tenantId, ticketData) => {
  try {
    const { userModelDB } = await getTenantModels(tenantId);

    // Get all active admin users
    const adminUsers = await userModelDB.find({ role: "admin", is_active: true });

    if (!adminUsers || adminUsers.length === 0) {
      console.log("No active admin users found");
      return;
    }

    // 1️⃣ Send ONE in-app notification to all admins (Broadcast)
    // adminId is passed as null or first admin ID because sendAdminNotification handles broadcasting to the "admins" room
    const adminNotificationPromise = sendAdminNotification(tenantId, adminUsers[0]._id, {
      title: "New Support Ticket Created",
      message: `Ticket ${ticketData.ticket_id} has been created by ${ticketData.user_email}`,
      type: "ticket",
      relatedId: ticketData.ticket_id,
      relatedModel: "Ticket",
      link: `/tickets/${ticketData.ticket_id}`,
    }).catch((err) => console.error("Failed to send admin in-app notification:", err.message));

    // 2️⃣ Send individual emails to each admin user
    const emailPromises = adminUsers.map(async (admin) => {
      try {
        const emailHtml = generateTicketEmailTemplate(ticketData);
        await sendEmailNotification({
          to: admin.email,
          subject: `New Support Ticket: ${ticketData.ticket_id}`,
          html: emailHtml,
        });
      } catch (err) {
        console.error(`Failed to send email to admin ${admin.email}:`, err.message);
      }
    });

    // Wait for everything to complete
    await Promise.all([adminNotificationPromise, ...emailPromises]);
    console.log(
      `Successfully notified ${adminUsers.length} admin(s) via email and sent 1 group notification for ticket ${ticketData.ticket_id}`
    );
  } catch (error) {
    console.error("Error in notifyAdminsInBackground:", error);
  }
};

const notifyUsersInBackground = async ({
  tenantId,
  ticketData = {},
  user_id = "",
  templateFunction = () => "",
  subject = "",
  message = "",
}) => {
  try {
    const { userModelDB } = await getTenantModels(tenantId);

    // First get the user who raised the ticket
    const user = await userModelDB.findOne({ _id: user_id });

    if (!user) {
      console.log("User not found");
      return;
    }

    // 1️⃣ Send ONE in-app notification to the user who raised the ticket
    const userNotificationPromise = sendUserNotification(tenantId, user_id, {
      title: subject,
      message: message,
      type: "ticket",
      relatedId: ticketData.ticket_id,
      relatedModel: "Ticket",
      link: `/tickets/${ticketData.ticket_id}`,
    }).catch((err) => console.error("Failed to send user in-app notification:", err.message));

    const emailHtml = templateFunction(ticketData);
    await sendEmailNotification({
      to: user.email,
      subject: subject,
      html: emailHtml,
    });
    // Wait for everything to complete
    await Promise.all([userNotificationPromise]);
  } catch (error) {
    console.error("Error in notifyAdminsInBackground:", error);
  }
};
