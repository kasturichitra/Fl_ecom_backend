import {
    getTopBrandsByCategoryService,
    getTopProductsByCategoryService,
} from "./dashboardService.js";

export const getTopBrandsByCategory = async (req, res) => {
    try {
        const tenantID = req.headers["x-tenant-id"];
        const data = await getTopBrandsByCategoryService(tenantID);
        res.status(200).json({
            success: true,
            message: "Top brands by category fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error("Error fetching top brands:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getTopProductsByCategory = async (req, res) => {
    try {
        const tenantID = req.headers["x-tenant-id"];
        const data = await getTopProductsByCategoryService(tenantID);
        res.status(200).json({
            success: true,
            message: "Top products by category fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
