import bcrypt from "bcryptjs";

import UserModel from "../Users/userModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import generateToken from "../utils/generateToken.js";


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