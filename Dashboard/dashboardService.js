import OrdersModel from "../Orders/orderModel.js";

export const getTopBrandsByCategoryService = async (tenantID) => {
    const Orders = await OrdersModel(tenantID);

    const pipeline = [
        // 1. Filter only delivered orders
        {
            $match: {
                order_status: "Delivered",
            },
        },
        // 2. Unwind order_products
        {
            $unwind: "$order_products",
        },
        // 3. Lookup product details
        {
            $lookup: {
                from: "products",
                let: { productUniqueId: "$order_products.product_unique_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product_unique_id", "$$productUniqueId"] },
                        },
                    },
                    {
                        $project: {
                            category_unique_id: 1,
                            brand_unique_id: 1,
                            category_name: 1,
                            brand_name: 1,
                        },
                    },
                ],
                as: "productDetails",
            },
        },
        // 4. Unwind productDetails
        {
            $unwind: "$productDetails",
        },
        // 5. Group by Category AND Brand to get total count
        {
            $group: {
                _id: {
                    category_id: "$productDetails.category_unique_id",
                    brand_id: "$productDetails.brand_unique_id",
                },
                category_name: { $first: "$productDetails.category_name" },
                brand_name: { $first: "$productDetails.brand_name" },
                count: { $sum: "$order_products.quantity" },
            },
        },
        // 6. Sort by count descending
        {
            $sort: { count: -1 },
        },
        // 7. Group by Category to collect brands
        {
            $group: {
                _id: "$_id.category_id",
                category_name: { $first: "$category_name" },
                brands: {
                    $push: {
                        brand_name: "$brand_name",
                        count: "$count",
                    },
                },
            },
        },
        // 8. Slice top 5 and Project
        {
            $project: {
                _id: 0,
                category_name: 1,
                brands: { $slice: ["$brands", 5] },
            },
        },
        // 9. Sort by Category Name
        {
            $sort: { category_name: 1 },
        },
    ];

    const result = await Orders.aggregate(pipeline);
    return result;
};

export const getTopProductsByCategoryService = async (tenantID) => {
    const Orders = await OrdersModel(tenantID);

    const pipeline = [
        // 1. Filter only delivered orders
        {
            $match: {
                order_status: "Delivered",
            },
        },
        // 2. Unwind order_products
        {
            $unwind: "$order_products",
        },
        // 3. Lookup product details
        {
            $lookup: {
                from: "products",
                let: { productUniqueId: "$order_products.product_unique_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product_unique_id", "$$productUniqueId"] },
                        },
                    },
                    {
                        $project: {
                            category_unique_id: 1,
                            product_name: 1,
                            category_name: 1,
                        },
                    },
                ],
                as: "productDetails",
            },
        },
        // 4. Unwind productDetails
        {
            $unwind: "$productDetails",
        },
        // 5. Group by Category AND Product to get total count
        {
            $group: {
                _id: {
                    category_id: "$productDetails.category_unique_id",
                    product_name: "$productDetails.product_name",
                },
                category_name: { $first: "$productDetails.category_name" },
                product_name: { $first: "$productDetails.product_name" },
                count: { $sum: "$order_products.quantity" },
            },
        },
        // 6. Sort by count descending
        {
            $sort: { count: -1 },
        },
        // 7. Group by Category to collect products
        {
            $group: {
                _id: "$_id.category_id",
                category_name: { $first: "$category_name" },
                products: {
                    $push: {
                        product_name: "$product_name",
                        count: "$count",
                    },
                },
            },
        },
        // 8. Slice top 5 and Project
        {
            $project: {
                _id: 0,
                category_name: 1,
                products: { $slice: ["$products", 5] },
            },
        },
        // 9. Sort by Category Name
        {
            $sort: { category_name: 1 },
        },
    ];

    const result = await Orders.aggregate(pipeline);
    return result;
};
