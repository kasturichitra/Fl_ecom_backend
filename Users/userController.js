import { addAddressService, loginUserService, registerUserService, updateUserAddressService, updateUserService } from "./userService.js";

export const registerUserController = async (req, res) => {
  try {
    const { userName, email, phone_number, password } = req.body;
    const tenateID = req.headers["x-tenant-id"];

    if (!userName || !email || !phone_number || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'All fields (userName, email, phone_number, password) are required',
      });
    }

    const user = await registerUserService(tenateID, userName, email, password, phone_number);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(400).json({
      status: 'failed',
      message: error.message,
    });
  }
};



export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenateID = req.headers["x-tenant-id"];
    const userData = await loginUserService(tenateID, email, password);
    res.json(userData);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};



export const updateUserController = async (req, res) => {
  try {
    const tenateID = req.headers["x-tenant-id"];
    const { id } = req.params;
    const updateData = req.body;

    const image = req.file ? req.file.path : undefined

    if (image) {
      updateData.image = image;
    }

    const updatedUser = await updateUserService(tenateID, id, updateData);
    res.status(200).json({ status: "Success", data: updatedUser });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};




export const addAddressController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { userID } = req.params; // userID passed in URL
    const addressData = req.body;  // address fields from body

    if (!tenantID) {
      return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });
    }

    if (!userID) {
      return res.status(400).json({ status: "Failed", message: "User ID is required" });
    }

    if (!addressData || Object.keys(addressData).length === 0) {
      return res.status(400).json({ status: "Failed", message: "Address data is required" });
    }

    const updatedUser = await addAddressService(tenantID, userID, addressData);

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
    const tenantID = req.headers["x-tenant-id"];
    const { id, addressId } = req.params;
    const addressData = req.body.address || req.body;

    if (!tenantID) {
      return res.status(400).json({
        status: "failed",
        message: "Tenant ID is required in headers",
      });
    }

    const updatedUser = await updateUserAddressService(
      tenantID,
      id,
      addressId,
      addressData
    );

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
