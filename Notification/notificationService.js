import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { NotificationModel } from "./notificationModel.js";


// export const getAllNotificationService = async (tenantId, role, userId, sort) => {
//     throwIfTrue(!tenantId, "Tenant ID is required");
//     const NotificationModelDB = await NotificationModel(tenantId);

//     let filter = {};

//     if (role === "user") {
//         filter = {
//             receiverModel: "user",
//             read: false, // Add this line to filter for unread notifications
//             $or: [
//                 { receiver: userId },
//                 { is_broadcast: true }
//             ]
//         };
//     }
//     if (role === "admin") {
//         filter = {
//             receiverModel: "admin",
//             read: false
//         };
//     }
//     const sortObj = buildSortObject(sort)
//     return await NotificationModelDB.find(filter).sort(sortObj);
// };


export const getAllNotificationService = async (
  tenantId,
  role,
  userId,
  page = 1,
  limit = 10,
  sort,
  fromDate,
  toDate
) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  // const NotificationModelDB = await NotificationModel(tenantId);
  const { notificationModelDB: NotificationModelDB } = await getTenantModels(tenantId);

  let filter = {};

  // Role-based filter
  if (role === "user") {
    filter = {
      receiverModel: "user",
      read: false,
      $or: [{ receiver: userId }, { is_broadcast: true }]
    };
  } else if (role === "admin") {
    filter = {
      receiverModel: "admin",
      read: false
    };
  }

  // 🔥 Add date filter
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }

  const sortObj = buildSortObject(sort);

  const totalCount = await NotificationModelDB.countDocuments(filter);

  const notifications = await NotificationModelDB.find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    notifications,
    totalCount,
    currentPage: Number(page),
    totalPages
  };
};


export const markNotificationAsReadService = async (tenantId, payload) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    // const NotificationModelDB = await NotificationModel(tenantId);
    const { notificationModelDB: NotificationModelDB } = await getTenantModels(tenantId);

    let idsToUpdate = [];
    if (Array.isArray(payload.ids)) {
        idsToUpdate = payload.ids;
    } else if (payload.id) {
        idsToUpdate = [payload.id];
    }

    if (idsToUpdate.length === 0) {
        throw new Error("No notification IDs provided");
    }

    const result = await NotificationModelDB.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { read: true } }
    );

    return result;
};

