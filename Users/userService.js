import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import generateToken from "../utils/generateToken.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import UserModel from "./userModel.js";
import { validateUserCreate } from "./validationUser.js";

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

  user.address.push(addressData);
  const updatedUser = await user.save();

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

  user.address[index] = { ...user.address[index]._doc, ...addressData };

  return await user.save();
};

export const employeCreateService = async (tenantId, userData) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const validation = validateUserCreate(userData);
  throwIfTrue(!validation.isValid, validation.message);

  const usersDB = await UserModel(tenantId);
  return await usersDB.create(userData);
};