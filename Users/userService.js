import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import generateToken from "../utils/generateToken.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import UserModel from "./userModel.js";

export const registerUserService = async (tenantId, username, email, password, phone_number) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const usersModelDB = await UserModel(tenantId);
  const userExists = await usersModelDB.findOne({ email });

  throwIfTrue(userExists, "User already exists");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await usersModelDB.create({
    username,
    email,
    phone_number,
    password: hashedPassword,
  });

  return {
    role: user.role,
    token: generateToken(user._id),
  };
};

export const loginUserService = async (tenantId, email, password) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  const usersModelDB = await UserModel(tenantId);

  const user = await usersModelDB.findOne({ email });
  throwIfTrue(!user, "No user found with the provided email");

  const isMatch = await bcrypt.compare(password, user.password);
  throwIfTrue(!isMatch, "Invalid password");

  return {
    token: generateToken(user._id),
    message: "Login successful",
    status: "Success",
  };
};

export const updateUserService = async (tenantId, user_id, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");

  const usersModelDB = await UserModel(tenantId);

  const user = await usersModelDB.findById(user_id);
  throwIfTrue(!user, "No user found with the provided ID");

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updateData.password, salt);
  } else {
    updateData.password = user.password;
  }

  if (updateData.address) {
    if (Array.isArray(updateData.address)) {
      user.address = updateData.address;
    } else {
      user.address.push(updateData.address);
    }
  }

  if (updateData.image) {
    try {
      if (user.image) {
        const oldImagePath = path.join(process.cwd(), user.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.image = updateData.image;
    } catch (err) {
      console.error("Error deleting old image:", err.message);
    }
  }

  if (updateData.username) user.username = updateData.username;
  if (updateData.phone_number) user.phone_number = updateData.phone_number;
  if (updateData.email) user.email = updateData.email;
  if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  if (updateData.role) user.role = updateData.role;

  const updatedUser = await user.save();

  const result = updatedUser.toObject();
  delete result.password;

  return result;
};

export const addAddressService = async (tenantId, user_id, addressData) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  throwIfTrue(!addressData, "Address data is required");

  const usersModelDB = await UserModel(tenantId);

  const user = await usersModelDB.findById(user_id);
  throwIfTrue(!user, "No user found with the provided ID");

  user.address.push(addressData);

  const updatedUser = await user.save();

  const result = updatedUser.toObject();
  delete result.password;

  return result;
};

export const updateUserAddressService = async (tenantId, user_id, address_id, addressData) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  throwIfTrue(!address_id, "Address ID is Required");
  throwIfTrue(!addressData, "Address data is required");

  const usersModelDB = await UserModel(tenantId);
  const user = await usersModelDB.findById(user_id);
  throwIfTrue(!user, "No user found with the provided ID");

  const addressIndex = user.address.findIndex((addr) => addr._id.toString() === address_id);
  if (addressIndex === -1) throw new Error("Address not found");

  user.address[addressIndex] = {
    ...user.address[addressIndex]._doc,
    ...addressData,
  };

  const updatedUser = await user.save();
  return updatedUser;
};
