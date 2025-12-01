import {
  getWishlistProductsServices,
  getWishlistServices,
  removeWishlistServices,
  createWishlistServices,
} from "./wishlistService.js";

/* ---------------------------------------------
   CREATE WISHLIST
----------------------------------------------*/
export const createWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { user_id, product_id } = req.body;

    const response = await createWishlistServices(tenantID, user_id, product_id);

    return res.status(201).json({
      status: "success",
      message: "Product added to wishlist successfully",
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

/* ---------------------------------------------
   GET WISHLIST PRODUCTS
----------------------------------------------*/
export const getWishlistProductsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const { data, totalCount } = await getWishlistProductsServices(tenantID, user_id);

    return res.status(200).json({
      status: "Success",
      message: "Wishlist products fetched successfully",
      data,
      totalCount,
    });
  } catch (error) {
    console.error("getWishlistProducts error ===>", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};

/* ---------------------------------------------
   GET WISHLIST (ONLY IDS)
----------------------------------------------*/
export const getWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;

    const response = await getWishlistServices(tenantID, user_id);

    return res.status(200).json({
      status: "Success",
      message: "Wishlist fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("wishlist error ====>", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};

/* ---------------------------------------------
   REMOVE FROM WISHLIST
----------------------------------------------*/
export const removeWishlistController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id: user_id } = req.params;
    const { product_id } = req.body;

    const response = await removeWishlistServices(tenantID, user_id, product_id);

    return res.status(200).json({
      status: "Success",
      message: "Product removed from wishlist successfully",
      data: response,
    });
  } catch (error) {
    console.error("removeWishlist error ===>", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};

// import {
//   getWishlistProductsServices,
//   getWishlistServices,
//   removeWishlistServices,
//   createWishlistServices,
// } from "./wishlistService.js";

// export const createWishlistController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { user_id, product_id } = req.body;

//     const response = await createWishlistServices(tenantID, user_id, product_id);

//     res.status(201).json({
//       status: "success",
//       message: "Product added to wishlist successfully",
//       data: response,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };

// export const getWishlistProductsController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { id } = req.params; // user_id

//     const response = await getWishlistProductsServices(tenantID, id);

//     res.status(200).json({
//       status: "Success",
//       message: "Wishlist products fetched successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("getWishlistProducts error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const getWishlistController = async (req, res) => {
//   try {
//     const { id } = req.params; //User ID
//     const tenantID = req.headers["x-tenant-id"];

//     const response = await getWishlistServices(tenantID, id);

//     res.status(200).json({
//       status: "Success",
//       message: "Wishlist fetched successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("wishlist error ====>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const removeWishlistController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { id } = req.params;
//     const { product_id } = req.body;

//     if (!tenantID) throw new Error("Tenant ID is required");
//     if (!id) throw new Error("User ID is required");
//     if (!product_id) throw new Error("Product ID is required");

//     const response = await removeWishlistServices(tenantID, id, product_id);

//     res.status(200).json({
//       status: "Success",
//       message: "Product removed from wishlist successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("removeWishlist error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };
