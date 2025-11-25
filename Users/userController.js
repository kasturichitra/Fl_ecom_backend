import {
  addAddressService,
  employeCreateService,
  getAllUsersService,
  getUserByIdService,
  loginUserService,
  registerUserService,
  updateUserAddressService,
  updateUserService,
} from "./userService.js";

export const registerUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { username, email, phone_number, password } = req.body;

    if (!username || !email || !phone_number || !password)
      return res.status(400).json({ status: "failed", message: "All fields are required" });

    const user = await registerUserService(tenantId, username, email, password, phone_number);

    res.status(201).json({ status: "success", message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ status: "failed", message: error.message });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { email, password } = req.body;

    const userData = await loginUserService(tenantId, email, password);
    res.json(userData);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const { totalCount, currentPage, totalPages, limit, data } = await getAllUsersService(tenantId, filters);
    res.status(200).json({ status: "Success", totalCount, currentPage, totalPages, limit, data });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const user = await getUserByIdService(tenantId, id);
    res.status(200).json({ status: "Success", data: user });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
}

export const updateUserController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) updateData.image = req.file.path;

    const updatedUser = await updateUserService(tenantId, id, updateData);
    res.status(200).json({ status: "Success", data: updatedUser });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

export const addAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { user_id } = req.params;

    if (!tenantId || !user_id)
      return res.status(400).json({ status: "Failed", message: "Tenant ID & User ID required" });

    const updatedUser = await addAddressService(tenantId, user_id, req.body);

    res.status(200).json({
      status: "Success",
      message: "Address added successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

export const updateUserAddressController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id, address_id } = req.params;

    const updatedUser = await updateUserAddressService(tenantId, id, address_id, req.body.address || req.body);

    res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ status: "failed", message: error.message });
  }
};

export const employeCreateController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const response = await employeCreateService(tenantId, req.body);

    res.status(201).json({
      status: "Success",
      message: "Employee created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to create employee",
      error: error.message,
    });
  }
};
