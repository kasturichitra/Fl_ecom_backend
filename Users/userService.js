import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import generateToken from "../utils/generateToken.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import UserModel from "./userModel.js";
import { validateUserCreate } from "./validationUser.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { fcm } from "../utils/firebase-admin.js";

export const registerUserService = async (tenantId, username, email, password, phone_number) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const usersDB = await UserModel(tenantId);
  throwIfTrue(await usersDB.findOne({ email }), "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await usersDB.create({
    username,
    email,
    phone_number,
    password: hashedPassword,
  });

  return { role: user.role, token: generateToken(user._id) };
};

export const loginUserService = async (tenantId, email, password) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findOne({ email });
  throwIfTrue(!user, "No user found with the provided email");

  throwIfTrue(!(await bcrypt.compare(password, user.password)), "Invalid password");

  return { token: generateToken(user._id), message: "Login successful", status: "Success" };
};

export const getAllUsersService = async (tenantId, filters) => {
  let {
    username,
    email,
    phone_number,
    branch_name,
    role,
    is_active,
    searchTerm,
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

  const usersDB = await UserModel(tenantId);
  const users = await usersDB.find(query).sort(sortObj).skip(skip).limit(limit);

  const totalCount = await usersDB.countDocuments(query);

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

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findById(id);

  user.password = undefined;

  return user;
};

export const updateUserService = async (tenantId, user_id, updateData) => {
  throwIfTrue(!tenantId || !user_id, "Tenant ID & User ID Required");

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  if (updateData.image && user.image) {
    try {
      const oldPath = path.join(process.cwd(), user.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch {}
  }

  Object.assign(user, updateData);

  const updatedUser = await user.save();
  const result = updatedUser.toObject();
  delete result.password;

  return result;
};

export const addAddressService = async (tenantId, user_id, addressData) => {
  throwIfTrue(!tenantId || !user_id || !addressData, "All fields required");

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  // If new address is default: true → make all existing addresses default:false
  if (addressData.default === true) {
    user.address.forEach(addr => {
      addr.default = false;
    });
  }

  // Push the new address
  user.address.push(addressData);

  const updatedUser = await user.save();

  // Remove password
  const res = updatedUser.toObject();
  delete res.password;

  return res;
};

export const updateUserAddressService = async (tenantId, user_id, address_id, addressData) => {
  throwIfTrue(!tenantId || !user_id || !address_id || !addressData, "Required fields missing");

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  const index = user.address.findIndex((a) => a._id.toString() === address_id);
  throwIfTrue(index === -1, "Address not found");

  if (addressData.default === true) {
    // Make all other addresses non-default
    user.address.forEach((addr, i) => {
      if (i !== index) addr.default = false;
    });
  }
  // If default not passed OR false → previous defaults remain unchanged

  user.address[index] = {
    ...user.address[index]._doc,
    ...addressData,
  };

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

export const employeCreateService = async (tenantId, userData) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const validation = validateUserCreate(userData);
  throwIfTrue(!validation.isValid, validation.message);

  const usersDB = await UserModel(tenantId);
  return await usersDB.create(userData);
};

export const storeFcmTokenService = async (tenantId, user_id, token) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const usersDB = await UserModel(tenantId);
  const result = await usersDB.updateOne({ _id: user_id }, { $set: { fcm_token: token } });

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
