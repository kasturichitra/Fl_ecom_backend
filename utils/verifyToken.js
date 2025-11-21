import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../Users/userModel.js";
dotenv.config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const tenantId = req.headers["x-tenant-id"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "failed",
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded, "sdkjfksdf");

    const UserModelDB = await UserModel(tenantId);

    const user = await UserModelDB.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Access denied. User not found.",
      });
    }

    req.user = user;

    if (!decoded) {
      return res.status(401).json({
        status: "failed",
        message: "Access denied.  invalid token.",
      });
    }
    next();
  } catch (error) {
    console.log("token error====>", error);

    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default verifyToken;
