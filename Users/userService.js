import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import UsersModel from './userModel.js';
import fs from "fs";
import path from "path";
export const registerUserService = async (tenateID, userName, email, password, phone_number) => {
  try {
    if (!tenateID) throw new Error("Tenant ID is required");

    const usersModelDB = await UsersModel(tenateID)
    const userExists = await usersModelDB.findOne({ email });

    if (userExists) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await usersModelDB.create({
      userName,
      email,
      phone_number,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error('Invalid user data');
    }

    return {
      role: user.role,
      token: generateToken(user._id),
    };
  } catch (error) {
    console.log("User registration error===>", error.message);
    throw new Error(error.message);


  }
};


export const loginUserService = async (tenateID, email, password) => {
  try {
    if (!tenateID) throw new Error("Tenant ID is Required");

    const usersModelDB = await UsersModel(tenateID)

    const user = await usersModelDB.findOne({ email });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    return {
      token: generateToken(user._id),
      message: 'Login successful',
      status: "Success"
    };

  } catch (error) {
    console.log("User Login error===>", error.message);
    throw new Error(error.message);
  }
};


export const updateUserService = async (tenantID, userID, updateData) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!userID) throw new Error("User ID is required");

    const usersModelDB = await UsersModel(tenantID);

    const user = await usersModelDB.findById(userID);
    if (!user) throw new Error("User not found");

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    } else {
      updateData.password = user.password;
    }

    if (updateData.address) {
      if (Array.isArray(updateData.address)) {
        user.address = updateData.address;
      } else {
        user.address.push(updateData.address);
      }
    }

    if (updateData.image) {
      try {
        if (user.image) {
          const oldImagePath = path.join(process.cwd(), user.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Old image deleted:", oldImagePath);
          }
        }
        user.image = updateData.image;
      } catch (err) {
        console.error("Error deleting old image:", err.message);
      }
    }

    if (updateData.userName) user.userName = updateData.userName;
    if (updateData.phone_number) user.phone_number = updateData.phone_number;
    if (updateData.email) user.email = updateData.email;
    if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
    if (updateData.role) user.role = updateData.role;

    const updatedUser = await user.save();

    const result = updatedUser.toObject();
    delete result.password;

    return result;
  } catch (error) {
    console.error("User update error ===>", error.message);
    throw new Error(error.message);
  }
};


export const addAddressService = async (tenantID, userID, addressData) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!userID) throw new Error("User ID is required");

    const usersModelDB = await UsersModel(tenantID);

    const user = await usersModelDB.findById(userID);
    if (!user) throw new Error("User not found");

    user.address.push(addressData);

    const updatedUser = await user.save();

    const result = updatedUser.toObject();
    delete result.password;

    return result;
  } catch (error) {
    console.error("Add Address Service Error:", error.message);
    throw new Error(error.message);
  }
};

export const updateUserAddressService = async (tenantID, userID, addressID, addressData) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!userID) throw new Error("User ID is required");
    if (!addressID) throw new Error("Address ID is required");
    if (!addressData) throw new Error("Address data is required");

    const usersModelDB = await UsersModel(tenantID);
    const user = await usersModelDB.findById(userID);
    if (!user) throw new Error("User not found");

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressID
    );
    if (addressIndex === -1) throw new Error("Address not found");

    user.address[addressIndex] = {
      ...user.address[addressIndex]._doc,
      ...addressData,
    };

    console.log(user,'user data');
    

    const updatedUser = await user.save();
    return updatedUser;
  } catch (error) {
    console.error("Address update error ===>", error.message);
    throw new Error(error.message);
  }
};
  