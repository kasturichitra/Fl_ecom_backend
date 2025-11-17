import { createBannersServices, deleteBannerServices, getAllBannersServices, updatebannersServices } from "./bannersService.js";

export const createBannersController = async (req, res) => {
    try {
        const tenantID = req.headers["x-tenant-id"];

        if (!tenantID) {
            return res.status(400).json({
                status: "Failed",
                message: "Tenant ID is required in headers",
            });
        }

        const banner_image = req.file ? req.file.path : null;

        const {
            banner_title,
            banner_subtitle,
            banner_description,
            banner_link,
            start_date,
            end_date,
            is_active,
            priority,
        } = req.body;

        if (!banner_title || !start_date || !end_date) {
            return res.status(400).json({
                status: "Failed",
                message: "banner_title, start_date and end_date are required",
            });
        }

        const bannerData = {
            banner_title,
            banner_subtitle,
            banner_description,
            banner_link,
            start_date,
            end_date,
            is_active,
            priority,
            banner_image,
        };

        const newBanner = await createBannersServices(tenantID, bannerData);

        return res.status(201).json({
            status: "Success",
            message: "Offer banner created successfully",
            data: newBanner,
        });
    } catch (error) {
        console.error("Error creating banner:", error);
        return res.status(500).json({
            status: "Failed",
            message: error.message || "Internal server error",
        });
    }
};



export const getBannersController = async (req, res) => {
    try {
        const tenantID = req.headers["x-tenant-id"];

        if (!tenantID) {
            return res.status(400).json({
                status: "Failed",
                message: "Tenant ID is required in headers",
            });
        }

        const banners = await getAllBannersServices(tenantID);

        // const baseUrl = `${req.protocol}://${req.get("host")}`;
        // const bannersWithUrl = banners.map((banner) => ({
        //   ...banner._doc,
        //   banner_image: banner.banner_image
        //     ? `${baseUrl}/uploads/bannersImages/${banner.banner_image}`
        //     : null,
        // }));

        return res.status(200).json({
            status: "Success",
            message: "Banners fetched successfully",
            data: banners,
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return res.status(500).json({
            status: "Failed",
            message: error.message || "Internal server error",
        });
    }
};



export const updateBannerController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params; // banner _id

    if (!tenantID || !id) {
      return res.status(400).json({
        status: "Failed",
        message: "Tenant ID and Banner ID are required",
      });
    }

    const {
      banner_title,
      banner_subtitle,
      banner_description,
      banner_link,
      start_date,
      end_date,
      is_active,
      priority,
    } = req.body;

    const updatedData = {
      banner_title,
      banner_subtitle,
      banner_description,
      banner_link,
      start_date,
      end_date,
      is_active,
      priority,
    };

    const newImageFilename =req.file ? req.file.path : null;

    const updatedBanner = await updatebannersServices(
      tenantID,
      id,
      updatedData,
      newImageFilename
    );

    return res.status(200).json({
      status: "Success",
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal server error",
    });
  }
};




export const deleteBannerController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params; // banner ID

    if (!tenantID || !id) {
      return res.status(400).json({
        status: "Failed",
        message: "Tenant ID and Banner ID are required",
      });
    }

    const deletedBanner = await deleteBannerServices(tenantID, id);

    return res.status(200).json({
      status: "Success",
      message: "Banner deleted successfully",
      data: deletedBanner,
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal server error",
    });
  }
};