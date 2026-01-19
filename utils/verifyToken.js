import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { getTenantModels } from "../lib/tenantModelsCache.js";

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

    if (!decoded) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token",
      });
    }

    const { userModelDB, roleModelDB, permissionModelDB } = await getTenantModels(tenantId);

    const user = await userModelDB
      .findById(decoded.id)
      .populate({
        path: "role_id",
        populate: { path: "permissions", select: "key" },
      })
      .select("_id username email role_id is_active user_id");

    if (!user || !user.is_active) {
      return res.status(401).json({
        status: "failed",
        message: "User not found or inactive",
      });
    }

    console.log("get user_id from verifyToken", user.user_id);

    /* ---------------------------------- */
    /* 5️⃣ Extract permission keys         */
    /* ---------------------------------- */
    const permissions = user.role_id?.permissions?.map((p) => p.key) || [];

    /* ---------------------------------- */
    /* 6️⃣ Attach user & permissions       */
    /* ---------------------------------- */
    req.user = {
      _id: user._id,
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      // role: user.role,
      role_id: user.role_id?._id,
      role: user.role_id?.name || "N/A",
      permissions, // Permission keys array for fast authorization
    };
    req.tenantId = tenantId;
    console.log("User in verifyToken after attach ===>", req.user);
    next();
  } catch (error) {
    console.error("Auth error:", error);

    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token",
    });
  }
};

export default verifyToken;
