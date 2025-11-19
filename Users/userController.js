import {
  addAddressService,
  loginUserService,
  registerUserService,
  updateUserAddressService,
  updateUserService,
} from "./userService.js";

export const registerUserController = async (req, res) => {
  try {
    const { username, email, phone_number, password } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    if (!username || !email || !phone_number || !password) {
      return res.status(400).json({
        status: "failed",
        message: "All fields (username, email, phone_number, password) are required",
      });
    }

    const user = await registerUserService(tenantId, username, email, password, phone_number);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.headers["x-tenant-id"];
    const userData = await loginUserService(tenantId, email, password);
    res.json(userData);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    const updateData = req.body;

    const image = req.file ? req.file.path : undefined;

    if (image) {
      updateData.image = image;
    }

    const updatedUser = await updateUserService(tenantId, id, updateData);
    res.status(200).json({ status: "Success", data: updatedUser });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

export const addAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { user_id } = req.params; // user_id passed in URL
    const addressData = req.body; // address fields from body

    if (!tenantId) {
      return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });
    }

    if (!user_id) {
      return res.status(400).json({ status: "Failed", message: "User ID is required" });
    }

    if (!addressData || Object.keys(addressData).length === 0) {
      return res.status(400).json({ status: "Failed", message: "Address data is required" });
    }

    const updatedUser = await addAddressService(tenantId, user_id, addressData);

    return res.status(200).json({
      status: "Success",
      message: "Address added successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Add Address Controller Error:", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateUserAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id, address_id } = req.params;
    const addressData = req.body.address || req.body;

    if (!tenantId) {
      return res.status(400).json({
        status: "failed",
        message: "Tenant ID is required in headers",
      });
    }

    const updatedUser = await updateUserAddressService(tenantId, id, address_id, addressData);

    res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Address update error:", error.message);
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};
