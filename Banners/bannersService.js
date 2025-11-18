import BannerModel from "./bannerModel.js";
import fs from "fs";
import path from "path";

export const createBannerService = async (tenantID, bannerData) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");

    const bannerModelDB = await BannerModel(tenantID);
    const createdBanner = await bannerModelDB.create(bannerData);

    return createdBanner;
  } catch (error) {
    throw new Error(error.message || "Error creating offer banner");
  }
};

export const getAllBannersService = async (tenantID) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");

    const bannerModelDB = await BannerModel(tenantID);
    const response = await bannerModelDB.find().sort({ createdAt: -1 });

    return response;
  } catch (error) {
    throw new Error(error.message || "Error fetching offer banners");
  }
};

export const updateBannerService = async (tenantID, bannerId, updatedData, newImageFilename) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!bannerId) throw new Error("Banner ID is required");

    const bannerModelDB = await BannerModel(tenantID);
    const existingBanner = await bannerModelDB.findById(bannerId);

    if (!existingBanner) throw new Error("Banner not found");

    const deleteFileIfExists = (filePath) => {
      if (!filePath) return;

      let cleanedPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");

      const fullPath = path.resolve(process.cwd(), cleanedPath);

      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log("Deleted:", fullPath);
        } else {
          console.warn("File not found:", fullPath);
        }
      } catch (err) {
        console.warn("Failed to delete:", fullPath, err.message);
      }
    };

    if (newImageFilename && existingBanner.banner_image) {
      const oldImagePath = existingBanner.banner_image;

      deleteFileIfExists(oldImagePath);
      updatedData.banner_image = newImageFilename;
    }

    const updatedBanner = await bannerModelDB.findByIdAndUpdate(bannerId, updatedData, {
      new: true,
      runValidators: true,
    });

    return updatedBanner;
  } catch (error) {
    throw new Error(error.message || "Error updating banner");
  }
};

export const deleteBannerService = async (tenantID, bannerId) => {
  try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!bannerId) throw new Error("Banner ID is required");

    const bannerModelDB = await BannerModel(tenantID);
    console.log(bannerId, "bannerId");

    const existingBanner = await bannerModelDB.findById(bannerId);

    if (!existingBanner) throw new Error("Banner not found");

    const deleteIfExists = (filePath) => {
      if (!filePath) return;

      const filePathCleaned = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
      const fullPathResolved = path.resolve(process.cwd(), filePathCleaned);

      try {
        if (fs.existsSync(fullPathResolved)) {
          fs.unlinkSync(fullPathResolved);
        }
      } catch (error) {
        throw new Error(`Failed to delete file: ${fullPathResolved}. ${error.message}`);
      }
    };

    if (existingBanner.banner_image) {
      const oldImagePath = existingBanner.banner_image;
      deleteIfExists(oldImagePath);
    }

    const deletedBanner = await bannerModelDB.findByIdAndDelete(bannerId);
    return deletedBanner;
  } catch (error) {
    throw new Error(error.message || "Error deleting banner");
  }
};
