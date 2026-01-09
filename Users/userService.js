import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { validateUserCreate } from "./validationUser.js";
export const getAllUsersService = async (tenantId, filters) => {
  let {
    username,
    email,
    phone_number,
    branch_name,
    role,
    is_active,
    searchTerm,
    exceptRole, // Role of the user to be excluded
    page = 1,
    limit = 10,
    sort = "createdAt:desc",
  } = filters;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const skip = (page - 1) * limit;

  const query = {};

  if (username) query.username = username;
  if (email) query.email = email;
  if (phone_number) query.phone_number = phone_number;
  if (branch_name) query.branch_name = branch_name;
  if (role) query.role = role;
  if (is_active !== undefined) query.is_active = is_active === "true";

  if (exceptRole) query.role = { $ne: exceptRole };

  if (searchTerm) {
    query.$or = [
      { username: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone_number: { $regex: searchTerm, $options: "i" } },
      { branch_name: { $regex: searchTerm, $options: "i" } },
      { role: { $regex: searchTerm, $options: "i" } },
      { created_by: { $regex: searchTerm, $options: "i" } },
      { "address.house_number": { $regex: searchTerm, $options: "i" } },
      { "address.street": { $regex: searchTerm, $options: "i" } },
      { "address.landmark": { $regex: searchTerm, $options: "i" } },
      { "address.city": { $regex: searchTerm, $options: "i" } },
      { "address.district": { $regex: searchTerm, $options: "i" } },
      { "address.state": { $regex: searchTerm, $options: "i" } },
      { "address.country": { $regex: searchTerm, $options: "i" } },
      { "address.postal_code": { $regex: searchTerm, $options: "i" } },
    ];
  }

  const sortObj = buildSortObject(sort);

  // const usersDB = await UserModel(tenantId);
  const { userModelDB: usersDB } = await getTenantModels(tenantId);

  /* -------------------------------------------------------------
     🔥 OPTIMIZED QUERY with $facet (Single DB Call)
  -------------------------------------------------------------- */
  const pipeline = [
    { $match: query },
    { $sort: Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await usersDB.aggregate(pipeline);
  const users = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return {
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    limit,
    data: users,
  };
};

export const getUserByIdService = async (tenantId, id) => {
  throwIfTrue(!tenantId || !id, "Tenant ID & User ID Required");

  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(id);

  if (user) {
    user.password = undefined;
    if (user.business_detailes && Array.isArray(user.business_detailes)) {
      const activeBusiness = user.business_detailes.find((b) => b.is_active);
      const userObj = user.toObject();
      userObj.business_detailes = activeBusiness || null;
      return userObj;
    }
  }

  return user;
};

export const getAllRolesService = async (tenantId) => {
  const { roleModelDB } = await getTenantModels(tenantId);
  return await roleModelDB.find({}, "name _id");
};

export const updateUserService = async (tenantId, user_id, updateData) => {
  throwIfTrue(!tenantId || !user_id, "Tenant ID & User ID Required");
  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");
  /* =========================
     PASSWORD UPDATE LOGIC
  ========================== */
  if (updateData.current_password || updateData.new_password) {
    throwIfTrue(
      !updateData.current_password || !updateData.new_password,
      "Current password and new password are required"
    );
    const isPasswordMatch = await bcrypt.compare(updateData.current_password, user.password);
    throwIfTrue(!isPasswordMatch, "Current password is incorrect");
    // Hash new password
    user.password = await bcrypt.hash(updateData.new_password, 10);
    // Remove password fields from updateData
    delete updateData.current_password;
    delete updateData.new_password;
  }
  /* =========================
     IMAGE UPDATE LOGIC
  ========================== */
  if (updateData.image && user.image) {
    try {
      const oldPath = path.join(process.cwd(), user.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch { }
  }
  /* =========================
     UPDATE OTHER FIELDS
  ========================== */
  Object.assign(user, updateData);
  const updatedUser = await user.save();
  const result = updatedUser.toObject();
  delete result.password;
  return result;
};

export const addAddressService = async (tenantId, user_id, addressData) => {
  throwIfTrue(!tenantId || !user_id || !addressData, "All fields required");

  if (typeof addressData !== "object" || Array.isArray(addressData)) {
    throw new Error("addressData must be a single object, not an array");
  }

  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  // If new address is default: true → make all existing addresses default:false
  if (addressData.default === true) {
    user.address.forEach((addr) => {
      addr.default = false;
    });
  }

  user.address.push(addressData);

  const updatedUser = await user.save();

  const res = updatedUser.toObject();
  delete res.password;

  return res;
};

export const updateUserAddressService = async (tenantId, user_id, address_id, addressData) => {
  throwIfTrue(!tenantId || !user_id || !address_id || !addressData, "Required fields missing");

  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  const address = user.address.id(address_id);
  throwIfTrue(!address, "Address not found");

  // --------------------------
  // 🔥 Handle default=true logic
  // --------------------------
  if (addressData.default === true) {
    user.address.forEach((a) => {
      a.default = false;
    });
  }

  // --------------------------
  // 🔥 Update fields correctly (this avoids creating new address)
  // --------------------------
  Object.keys(addressData).forEach((key) => {
    address[key] = addressData[key];
  });

  const updatedUser = await user.save();
  return updatedUser;
};

export const deleteUserAddressService = async (tenantId, user_id, address_id) => {
  throwIfTrue(!tenantId || !user_id || !address_id, "Required fields missing");

  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  const address = user.address.id(address_id);
  throwIfTrue(!address, "Address not found");

  address.deleteOne(); // Mongoose subdocument remove

  const updatedUser = await user.save();
  return updatedUser;
};

// export const updateUserAddressService = async (tenantId, user_id, address_id, addressData) => {
//   throwIfTrue(!tenantId || !user_id || !address_id || !addressData, "Required fields missing");

//   const usersDB = await UserModel(tenantId);
//   const user = await usersDB.findById(user_id);
//   throwIfTrue(!user, "User not found");

//   const index = user.address.findIndex((a) => a._id.toString() === address_id);
//   throwIfTrue(index === -1, "Address not found");

//   user.address[index] = { ...user.address[index]._doc, ...addressData };

//   return await user.save();
// };

export const employeCreateService = async (tenantId, userData, fileBuffer) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  const { userModelDB, roleModelDB } = await getTenantModels(tenantId);
  const role_id = userData.role_id;
  const role = await roleModelDB.findById(role_id);
  throwIfTrue(!role, "Role not found");
  let image = null;
  if (fileBuffer) {
    image = await uploadImageVariants({
      fileBuffer,
      basePath: `${tenantId}/users/employee/${userData.email}`,
    });
  }
  const userDoc = {
    ...userData,
    role_id,
    role: role.name,
    image,
  };
  const validation = validateUserCreate(userDoc);
  throwIfTrue(!validation.isValid, validation.message);
  // Hash password
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  return await userModelDB.create(userData);
};

export const storeFcmTokenService = async (tenantId, user_id, token) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  // const usersDB = await UserModel(tenantId);
  const { userModelDB } = await getTenantModels(tenantId);
  const result = await userModelDB.updateOne({ _id: user_id }, { $set: { fcm_token: token } });

  // const updatedUser = await usersDB.findOne({ _id: user_id });

  // await fcm.send({
  //   token: updatedUser.fcm_token,
  //   notification: {
  //     title: "Title",
  //     body: "Notification working",
  //   },
  // });

  return result;
};

export const deleteUserAccountService = async (tenantId, user_id) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");

  const { userModelDB } = await getTenantModels(tenantId);
  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  // Toggle is_active status
  user.is_active = !user.is_active;

  const updatedUser = await user.save();

  return {
    message: `User account ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
    is_active: updatedUser.is_active
  };
};


// export const deactivateBusinessService = async (tenantId, user_id, getinumber) => {
//   throwIfTrue(!tenantId, "Tenant ID is Required");
//   throwIfTrue(!user_id, "User ID is Required");
//   throwIfTrue(!getinumber, "GSTIN Number is Required");

//   const { userModelDB } = await getTenantModels(tenantId);
//   const user = await userModelDB.findById(user_id);
//   throwIfTrue(!user, "User not found");

//   // Mark the specific business detail as inactive
//   if (user.business_detailes) {
//     user.business_detailes.forEach((detail) => {
//       if (detail.gstinNumber === getinumber) {
//         detail.is_active = false;
//       }
//     });
//   }

//   // Reset account_type to Personal only if no business details are active anymore
//   const hasActiveBusiness = user.business_detailes.some((detail) => detail.is_active);
//   if (!hasActiveBusiness) {
//     user.account_type = "Personal";
//   }

//   const updatedUser = await user.save();
//   const res = updatedUser.toObject();
//   delete res.password;

//   return res;
// };

