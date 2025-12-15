import bcrypt from "bcryptjs";

import UserModel from "../Users/userModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import deviceSessionModel from "./deviceSessionModel.js";
import { sendEmailOTP, sendMobileOTP } from "../utils/sendOTP.js";

export const registerUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is Required");

    const { username, email, password, phone_number } = req.body;

    const usersDB = await UserModel(tenantId);
    const existingUser = await usersDB.findOne({
      $or: [{ email }, { phone_number }],
    });
    throwIfTrue(existingUser, `User with phone number ${phone_number} or email ${email} already exists`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usersDB.create({
      username,
      email,
      phone_number,
      password: hashedPassword,
    });

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    res.status(201).json(successResponse("User registered successfully", { data: user }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, error));
  }
};

export const loginUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is Required");

    const { email, phone_number, password, device_id, device_name } = req.body;

    const deviceSessionDb = await deviceSessionModel(tenantId);
    const usersDB = await UserModel(tenantId);
    const existingUser = await usersDB.findOne({ $or: [{ email }, { phone_number }] });
    throwIfTrue(!existingUser, "User not found");

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    throwIfTrue(!isValidPassword, "Invalid password");

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, existingUser._id);

    let device = await deviceSessionDb.findOne({ user_id: existingUser._id, device_id: device_id, revoked_at: null });

    // 🟡 NEW DEVICE
    if (!device) {
      if (phone_number) await sendMobileOTP(phone_number, "123456");
      if (email) await sendEmailOTP(email, "123456");
      return res.json({ requireOtp: true });
    }

    // 🔴 DEVICE EXPIRED
    if (device.expiresAt < new Date()) {
      if (phone_number) await sendMobileOTP(phone_number, "123456");
      if (email) await sendEmailOTP(email, "123456");
      return res.json({ requireOtp: true });
    }

    device.lastLoginAt = new Date();
    await device.save();

    res.status(200).json(successResponse("Login successful", { data: token }));
  } catch (error) {
    res.status(401).json(errorResponse(error.message, error));
  }
};

export const logoutUserController = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json(successResponse("Logout successful"));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
