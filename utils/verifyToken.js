import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../Users/userModel.js";

dotenv.config();

const verifyToken = async (req, res, next) => {
  try {
    /* ---------------------------------- */
    /* 1️⃣ Tenant Validation               */
    /* ---------------------------------- */
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      return res.status(400).json({
        status: "failed",
        message: "Tenant ID is required",
      });
    }

    /* ---------------------------------- */
    /* 2️⃣ Access Token from Cookie        */
    /* ---------------------------------- */
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Not authenticated",
      });
    }

    /* ---------------------------------- */
    /* 3️⃣ Verify JWT                      */
    /* ---------------------------------- */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ---------------------------------- */
    /* 4️⃣ Tenant-specific User Model      */
    /* ---------------------------------- */
    const UserModelDB = await UserModel(tenantId);

    const user = await UserModelDB
      .findById(decoded.id)
      .select("_id username email role is_active");

    if (!user || !user.is_active) {
      return res.status(401).json({
        status: "failed",
        message: "User not found or inactive",
      });
    }

    /* ---------------------------------- */
    /* 5️⃣ Attach user to request          */
    /* ---------------------------------- */
    req.user = user;
    req.tenantId = tenantId;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token",
    });
  }
};

export default verifyToken;
