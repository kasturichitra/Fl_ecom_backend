import bcrypt from "bcryptjs";

import UserModel from "../Users/userModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

export const registerUserService = async (tenantId, data) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const { username, email, password, phone_number } = data;

  const usersDB = await UserModel(tenantId);
  //   throwIfTrue(await usersDB.findOne({ email }), "User already exists");
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
  return user;
};

export const loginUserService = async (tenantId, email, password) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");

  const usersDB = await UserModel(tenantId);
  const user = await usersDB.findOne({ email });
  throwIfTrue(!user, "No user found with the provided email");

  throwIfTrue(!(await bcrypt.compare(password, user.password)), "Invalid password");

  return { token: generateTokenAndSetCookie(user._id), message: "Login successful", status: "Success" };
};
