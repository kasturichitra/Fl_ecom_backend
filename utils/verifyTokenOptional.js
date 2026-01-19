import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../Users/userModel.js";
import RoleModel from "../Role/roleModel.js";
import PermissionModel from "../Permission/permissionModel.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

dotenv.config();

const verifyTokenOptional = async (req, res, next) => {
  try {
    /* ---------------------------------- */
    /* 1️⃣ Tenant Validation (REQUIRED)    */
    /* ---------------------------------- */
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      req.user = null;
      return next(); // 👈 DO NOT ERROR
    }

    /* ---------------------------------- */
    /* 2️⃣ Access Token from Cookie        */
    /* ---------------------------------- */
    const token = req.cookies?.token;

    if (!token) {
      req.user = null;
      req.tenantId = tenantId;
      return next();
    }

    /* ---------------------------------- */
    /* 3️⃣ Verify JWT                      */
    /* ---------------------------------- */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { roleModelDB, permissionModelDB, userModelDB } = await getTenantModels(tenantId);

    const user = await userModelDB.findById(decoded.id)
      .populate({
        path: "role_id",
        populate: { path: "permissions", select: "key" },
      })
      .select("_id username email role_id is_active user_id");

    if (!user || !user.is_active) {
      req.user = null;
      req.tenantId = tenantId;
      return next();
    }

    /* ---------------------------------- */
    /* 5️⃣ Extract permission keys         */
    /* ---------------------------------- */
    const permissions = user.role_id?.permissions?.map((p) => p.key) || [];

    /* ---------------------------------- */
    /* 6️⃣ Attach user & permissions       */
    /* ---------------------------------- */
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role_id?.name || "N/A",
      role_id: user.role_id?._id,
      permissions,
      user_id: user.user_id,
    };

    req.tenantId = tenantId;

    next();
  } catch (error) {
    // ⚠️ NEVER THROW IN OPTIONAL AUTH
    console.warn("Optional auth skipped:", error.message);

    req.user = null;
    next();
  }
};

export default verifyTokenOptional;
