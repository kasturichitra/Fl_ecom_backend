import { getTenantModels } from "../lib/tenantModelsCache.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { buildSortObject } from "../utils/buildSortObject.js";

export const createBannerService = async (tenantId, bannerData, bannerImageBuffers) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!bannerImageBuffers || bannerImageBuffers.length === 0, "At least one banner image is required");

  const { bannerModelDB } = await getTenantModels(tenantId);

  // Validate date ranges
  const startDate = new Date(bannerData.start_date);
  const endDate = new Date(bannerData.end_date);
  throwIfTrue(endDate <= startDate, "End date must be after start date");

  // Generate unique ID for the banner
  const count = await bannerModelDB.countDocuments();
  const banner_unique_id = `BAN${String(count + 1).padStart(6, "0")}`;
  bannerData.banner_unique_id = banner_unique_id;

  // Upload multiple banner images to S3 as an array
  const uploadedImages = [];
  if (bannerImageBuffers && bannerImageBuffers.length > 0) {
    for (let i = 0; i < bannerImageBuffers.length; i++) {
      const imageVariants = await uploadImageVariants({
        fileBuffer: bannerImageBuffers[i],
        basePath: `${tenantId}/Banners/${banner_unique_id}/image-${i}`,
      });
      uploadedImages.push(imageVariants);
    }
  }

  bannerData.banner_image = uploadedImages;

  const banner = await bannerModelDB.create(bannerData);
  return banner;
};

/**
 * Get all banners with filtering, sorting, and pagination
 */
export const getAllBannersService = async (tenantId, filters = {}) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { title, banner_type, section, store, item, is_active, searchTerm, sort, page = 1, limit = 10 } = filters;

  const { bannerModelDB } = await getTenantModels(tenantId);

  const query = {};

  // Build query filters
  if (title) query.title = { $regex: title, $options: "i" };
  if (banner_type) query.banner_type = banner_type;
  if (section) query.section = section;
  if (store) query.store = store;
  if (item) query.item = item;

  if (is_active === "true") query.is_active = true;
  if (is_active === "false") query.is_active = false;

  // Search across multiple fields
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { banner_type: { $regex: searchTerm, $options: "i" } },
      { section: { $regex: searchTerm, $options: "i" } },
      { store: { $regex: searchTerm, $options: "i" } },
      { item: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sortObj = buildSortObject(sort) || { priority: 1, createdAt: -1 };

  // Execute query with pagination
  const [data, totalCount] = await Promise.all([
    bannerModelDB.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
    bannerModelDB.countDocuments(query),
  ]);

  return {
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalCount / limitNum),
    data,
  };
};

/**
 * Get banner by unique ID
 */
export const getBannerByUniqueIdService = async (tenantId, banner_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!banner_unique_id, "Banner unique ID is required");

  const { bannerModelDB } = await getTenantModels(tenantId);

  const banner = await bannerModelDB.findOne({ banner_unique_id }).lean();
  throwIfTrue(!banner, "Banner not found");

  return banner;
};

/**
 * Update banner by unique ID
 */
export const updateBannerService = async (tenantId, banner_unique_id, updateData, bannerImageBuffers) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!banner_unique_id, "Banner unique ID is required");

  const { bannerModelDB } = await getTenantModels(tenantId);

  const existingBanner = await bannerModelDB.findOne({ banner_unique_id }).lean();
  throwIfTrue(!existingBanner, "Banner not found");

  // Validate date ranges if both dates are provided
  if (updateData.start_date && updateData.end_date) {
    const startDate = new Date(updateData.start_date);
    const endDate = new Date(updateData.end_date);
    throwIfTrue(endDate <= startDate, "End date must be after start date");
  }

  // Handle banner images upload and cleanup (now an array)
  if (bannerImageBuffers && bannerImageBuffers.length > 0) {
    // Delete existing banner images from S3 (all images and their variants)
    if (existingBanner.banner_image && Array.isArray(existingBanner.banner_image)) {
      for (const imageObj of existingBanner.banner_image) {
        if (imageObj && typeof imageObj === "object") {
          const imageUrls = Object.values(imageObj).filter((url) => typeof url === "string");
          await Promise.all(imageUrls.map(autoDeleteFromS3));
        }
      }
    }

    // Upload new banner images as an array
    const uploadedImages = [];
    for (let i = 0; i < bannerImageBuffers.length; i++) {
      const imageVariants = await uploadImageVariants({
        fileBuffer: bannerImageBuffers[i],
        basePath: `${tenantId}/Banners/${banner_unique_id}/image-${i}`,
      });
      uploadedImages.push(imageVariants);
    }
    updateData.banner_image = uploadedImages;
  }

  const updatedBanner = await bannerModelDB.findOneAndUpdate({ banner_unique_id }, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedBanner;
};

/**
 * Delete banner (soft delete by setting is_active to false)
 */
export const deleteBannerService = async (tenantId, banner_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!banner_unique_id, "Banner unique ID is required");

  const { bannerModelDB } = await getTenantModels(tenantId);

  const existingBanner = await bannerModelDB.findOne({ banner_unique_id }).lean();
  throwIfTrue(!existingBanner, "Banner not found");

  const deletedBanner = await bannerModelDB.findOneAndUpdate({ banner_unique_id }, { is_active: false }, { new: true });

  return deletedBanner;
};
