import UserModel from "../Users/userModel.js";

export const getFcmToken = async (tenantId, user_id) => {
  const usersModelDB = await UserModel(tenantId);
  const user = await usersModelDB.findById(user_id);
  console.log("user fcm token", user.fcm_token);
  return user.fcm_token;
};
