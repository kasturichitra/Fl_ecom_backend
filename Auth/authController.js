import bcrypt from "bcryptjs";

import UserModel from "../Users/userModel.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { generateAndSendOtp } from "../utils/sendOTP.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import deviceSessionModel from "./deviceSessionModel.js";
import otpModel from "./otpModel.js";
import { DEVICE_SESSION_EXPIRY_TIME } from "../lib/constants.js";

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
    const otpDb = await otpModel(tenantId);
    const existingUser = await usersDB.findOne({ $or: [{ email }, { phone_number }] });
    throwIfTrue(!existingUser, "User not found");

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    throwIfTrue(!isValidPassword, "Invalid password");

    let device = await deviceSessionDb.findOne({ user_id: existingUser._id, device_id: device_id, revoked_at: null });

    // 🟡 NEW DEVICE
    if (!device) {
      const options = {
        user_id: existingUser._id,
        device_id,
        purpose: "NEW_DEVICE",
        email,
        phone_number,
      };
      const response = await generateAndSendOtp(options, otpDb);
      return res.json({ requireOtp: true, reason: "NEW_DEVICE" });
    }

    // 🔴 DEVICE EXPIRED
    if (device.expires_at < new Date()) {
      const options = {
        user_id: existingUser._id,
        device_id,
        purpose: "DEVICE_SESSION_EXPIRED",
        email,
        phone_number,
      };
      const response = await generateAndSendOtp(options, otpDb);
      return res.json({ requireOtp: true, reason: "DEVICE_SESSION_EXPIRED" });
    }

    device.last_login_at = new Date();
    await device.save();

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, existingUser._id);

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

export const verifyOtpController = async (req, res) => {
  const tenantId = req.headers["x-tenant-id"];
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { user_id, device_id, otp, purpose, device_name } = req.body;

  const otpDb = await otpModel(tenantId);
  const deviceSessionDb = await deviceSessionModel(tenantId);

  const record = await otpDb.findOne({ user_id, device_id, purpose }).sort({ createdAt: -1 });
  console.log("Record is ===>", record);
  if (!record) return res.status(400).json({ message: "OTP expired" });

  const valid = await bcrypt.compare(otp, record.otp_hash);
  if (!valid) return res.status(401).json({ message: "Invalid OTP" });

  await otpDb.deleteOne({ _id: record._id });

  // 🔵 SIGNUP FLOW
  if (purpose === "SIGN_UP") {
    await User.findByIdAndUpdate(user_id, { is_active: true });

    await deviceSessionDb.create({
      user_id,
      device_id,
      device_name,
      is_trusted: true,
      last_login_at: new Date(),
      expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME),
    });
  }

  // 🟡 NEW DEVICE
  if (purpose === "NEW_DEVICE") {
    await deviceSessionDb.create({
      user_id,
      device_id,
      device_name,
      is_trusted: true,
      last_login_at: new Date(),
      expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME),
    });
  }

  // 🔴 PASSWORD EXPIRED
  if (purpose === "DEVICE_SESSION_EXPIRED") {
    await deviceSessionDb.updateOne(
      { user_id, device_id },
      { expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME) }
    );
  }

  res.json(successResponse("OTP verified successfully"));
};
