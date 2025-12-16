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

    const { username, email, password, phone_number, device_id, device_name } = req.body;

    const otpDb = await otpModel(tenantId);
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
      is_active: false,
    });

    const { otp_id } = await generateAndSendOtp(
      { user_id: user._id, device_id, purpose: "SIGN_UP", email, phone_number },
      otpDb
    );

    res.status(201).json({
      requireOtp: true,
      reason: "SIGN_UP",
      otp_id,
    });
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

    if (!existingUser.is_active) return res.json(errorResponse("OTP Verification is required"));

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
      const { otp_id } = await generateAndSendOtp(options, otpDb);
      return res.json({ requireOtp: true, reason: "NEW_DEVICE", otp_id });
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
      const { otp_id } = await generateAndSendOtp(options, otpDb);
      return res.json({ requireOtp: true, reason: "DEVICE_SESSION_EXPIRED", otp_id });
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

export const resendOtpController = async (req, res) => {
  const tenantId = req.headers["x-tenant-id"];
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { user_id, device_id, purpose, email, phone_number } = req.body;
  const otpDb = await otpModel(tenantId);
  const { otp_id } = await generateAndSendOtp({ user_id, device_id, purpose, email, phone_number }, otpDb);
  res.status(200).json({ requireOtp: true, reason: purpose, otp_id });
};

export const verifyOtpController = async (req, res) => {
  const tenantId = req.headers["x-tenant-id"];
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { otp, device_name, otp_id } = req.body;

  const otpDb = await otpModel(tenantId);
  const deviceSessionDb = await deviceSessionModel(tenantId);
  const userDb = await UserModel(tenantId);

  const record = await otpDb.findOne({
    _id: otp_id,
    consumed_at: null,
    expires_at: { $gt: new Date() },
  });

  if (!record) return res.status(400).json(errorResponse("OTP expired"));

  const valid = await bcrypt.compare(otp, record.otp_hash);
  if (!valid) return res.status(401).json(errorResponse("Invalid OTP"));

  if (record.consumed_at) return res.status(400).json(errorResponse("OTP already used"));
  // 🔒 Mark OTP as used
  record.consumed_at = new Date();
  await record.save();

  const { user_id, device_id, purpose } = record;

  // 🔵 SIGNUP FLOW
  if (purpose === "SIGN_UP") {
    await userDb.findByIdAndUpdate(user_id, { is_active: true });

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
