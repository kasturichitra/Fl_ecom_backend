import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

import UserModel from "../Users/userModel.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { generateAndSendOtp } from "../utils/sendOTP.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import deviceSessionModel from "./deviceSessionModel.js";
import otpModel from "./otpModel.js";
import { DEVICE_SESSION_EXPIRY_TIME } from "../lib/constants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const registerUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is Required");

    const { username, email, password, phone_number, device_name } = req.body;

    // Check for device_id cookie, generate new UUID if not present
    let device_id = req.cookies.device_id;
    if (!device_id) {
      device_id = randomUUID();
      // Set device_id cookie
      res.cookie("device_id", device_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: DEVICE_SESSION_EXPIRY_TIME,
        path: "/",
      });
    }

    const { otpModelDB, userModelDB } = await getTenantModels(tenantId);

    const existingUser = await userModelDB.findOne({
      $or: [{ email }, { phone_number }],
    });
    throwIfTrue(existingUser, `User with phone number ${phone_number} or email ${email} already exists`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModelDB.create({
      username,
      email,
      phone_number,
      password: hashedPassword,
      is_active: false,
    });

    const { otp_id } = await generateAndSendOtp(
      { user_id: user._id, device_id, purpose: "SIGN_UP", email, phone_number },
      otpModelDB
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

    const { email, phone_number, password, device_name, is_admin } = req.body;

    // Check for device_id cookie, generate new UUID if not present
    let device_id = req.cookies.device_id;
    if (!device_id) {
      device_id = randomUUID();
      // Set device_id cookie
      res.cookie("device_id", device_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: DEVICE_SESSION_EXPIRY_TIME,
        path: "/",
      });
    }

    const { deviceSessionModelDB, userModelDB, otpModelDB, roleModelDB } = await getTenantModels(tenantId);

    const existingUser = await userModelDB.findOne({ $or: [{ email }, { phone_number }] }).populate({
      path: "role_id",
      model: roleModelDB,
    })

    console.log("Existing User", existingUser);
    throwIfTrue(!existingUser, "User not found");
    if (is_admin) {
      throwIfTrue(existingUser.role_id.name !== "admin" && existingUser.role_id.name !== "employee", "User is not allowed this penal");
    }

    if (!existingUser.is_active) return res.json(errorResponse("OTP Verification is required"));

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    throwIfTrue(!isValidPassword, "Invalid password");

    let device = await deviceSessionModelDB.findOne({
      user_id: existingUser._id,
      device_id: device_id,
      revoked_at: null,
    });

    // 🟡 NEW DEVICE
    if (!device) {
      const options = {
        user_id: existingUser._id,
        device_id,
        purpose: "NEW_DEVICE",
        email,
        phone_number,
      };
      const { otp_id } = await generateAndSendOtp(options, otpModelDB);
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
      const { otp_id } = await generateAndSendOtp(options, otpModelDB);
      return res.json({ requireOtp: true, reason: "DEVICE_SESSION_EXPIRED", otp_id });
    }

    device.last_login_at = new Date();
    await device.save();

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, existingUser._id);

    res.status(200).json(successResponse("Login successful"));
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
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is Required");

    const { otp_id } = req.body;
    throwIfTrue(!otp_id, "otp_id is required");

    const { otpModelDB } = await getTenantModels(tenantId);

    const oldOtp = await otpModelDB.findOne({
      _id: otp_id,
      consumed_at: null,
      expires_at: { $gt: new Date() },
    });

    console.log("OTP Created At", oldOtp.createdAt);

    const RESEND_COOLDOWN_MS = 30 * 1000;

    const now = Date.now();
    const lastOtpTime = oldOtp.createdAt.getTime();

    if (now - lastOtpTime < RESEND_COOLDOWN_MS) {
      return res.status(429).json(errorResponse("Please wait before resending OTP"));
    }

    throwIfTrue(!oldOtp, "OTP expired. Please restart login.");

    const existingUser = await userModelDB.findOne({ _id: oldOtp.user_id });
    throwIfTrue(!existingUser, "User not found");

    // 🔥 Invalidate old OTP
    oldOtp.consumed_at = new Date();
    await oldOtp.save();

    // 🔁 Generate new OTP using SAME CONTEXT
    const { otp_id: newOtpId } = await generateAndSendOtp(
      {
        user_id: oldOtp.user_id,
        device_id: oldOtp.device_id,
        purpose: oldOtp.purpose,
        email: existingUser.email,
        phone_number: existingUser.phone_number,
      },
      otpModelDB
    );

    res.status(200).json({
      requireOtp: true,
      reason: oldOtp.purpose,
      otp_id: newOtpId,
    });
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const verifyOtpController = async (req, res) => {
  const tenantId = req.headers["x-tenant-id"];
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { otp, device_name, otp_id } = req.body;

  const { otpModelDB, deviceSessionModelDB, userModelDB } = await getTenantModels(tenantId);

  const record = await otpModelDB.findOne({
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
    await userModelDB.findByIdAndUpdate(user_id, { is_active: true });

    await deviceSessionModelDB.create({
      user_id,
      device_id,
      device_name,
      is_trusted: true,
      last_login_at: new Date(),
      expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME),
    });

    // Set Cookie upon successful signup
    generateTokenAndSetCookie(res, user_id);
  }

  // 🟡 NEW DEVICE
  if (purpose === "NEW_DEVICE") {
    await deviceSessionModelDB.create({
      user_id,
      device_id,
      device_name,
      is_trusted: true,
      last_login_at: new Date(),
      expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME),
    });

    // Set Cookie upon successful new device registrations
    generateTokenAndSetCookie(res, user_id);
  }

  // 🔴 PASSWORD EXPIRED
  if (purpose === "DEVICE_SESSION_EXPIRED") {
    await deviceSessionModelDB.updateOne(
      { user_id, device_id },
      { expires_at: new Date(Date.now() + DEVICE_SESSION_EXPIRY_TIME) }
    );

    // Set Cookie upon successful new device registrations
    generateTokenAndSetCookie(res, user_id);
  }

  res.json(successResponse("OTP verified successfully"));
};

export const forgotPasswordController = async (req, res) => {
  const tenantId = req.headers["x-tenant-id"];
  throwIfTrue(!tenantId, "Tenant ID required");

  const { email, phone_number } = req.body;

  // Check for device_id cookie, generate new UUID if not present
  let device_id = req.cookies.device_id;
  if (!device_id) {
    device_id = randomUUID();
    // Set device_id cookie
    res.cookie("device_id", device_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: DEVICE_SESSION_EXPIRY_TIME,
      path: "/",
    });
  }

  const { userModelDB, otpModelDB } = await getTenantModels(tenantId);

  const user = await userModelDB.findOne({ $or: [{ email }, { phone_number }] });

  // Always return success to prevent user enumeration
  if (!user) {
    return res.json(successResponse("If user exists, OTP sent"));
  }

  const { otp_id } = await generateAndSendOtp(
    {
      user_id: user._id,
      device_id,
      purpose: "FORGOT_PASSWORD",
      email: user.email,
      phone_number: user.phone_number,
    },
    otpModelDB
  );

  res.json({ requireOtp: true, reason: "FORGOT_PASSWORD", otp_id });
};

export const verifyForgotOtpController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID required");

    const { otp_id, otp } = req.body;

    const { otpModelDB } = await getTenantModels(tenantId);

    const record = await otpModelDB.findOne({
      _id: otp_id,
      purpose: "FORGOT_PASSWORD",
      consumed_at: null,
      expires_at: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json(errorResponse("OTP expired"));
    }

    const valid = await bcrypt.compare(otp, record.otp_hash);
    if (!valid) {
      return res.status(401).json(errorResponse("Invalid OTP"));
    }

    record.consumed_at = new Date();
    await record.save();

    // 🔐 Issue short-lived RESET token
    const resetToken = jwt.sign(
      {
        user_id: record.user_id,
        purpose: "RESET_PASSWORD",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.cookie("reset_token", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/", // 🔥 important
    });

    res.json(successResponse("OTP verified"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID required");

    const token = req.cookies.reset_token;

    console.log("Req cookies are ===>", req.cookies);
    throwIfTrue(!token, "Reset token missing or expired");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new Error("Invalid or expired reset token");
    }

    if (payload.purpose !== "RESET_PASSWORD") {
      throw new Error("Invalid reset token");
    }

    const { userModelDB, deviceSessionModelDB } = await getTenantModels(tenantId);

    const user = await userModelDB.findById(payload.user_id);
    throwIfTrue(!user, "User not found");

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();

    // 🔥 Revoke ALL device sessions
    await deviceSessionModelDB.updateMany({ user_id: user._id }, { revoked_at: new Date() });

    // 🧹 Clear reset cookie
    res.clearCookie("reset_token", {
      path: "/",
    });

    res.json(successResponse("Password reset successful"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getMeController = async (req, res) => {
  try {
    // If auth middleware didn't attach user
    if (!req.user) {
      return res.status(200).json({
        status: "success",
        isAuthenticated: false,
        user: null,
      });
    }

    return res.status(200).json({
      status: "success",
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role_id: req.user.role_id,
        permissions: req.user.permissions,
      },
    });
  } catch (error) {
    // ONLY real server errors should be 500
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch auth session",
    });
  }
};
