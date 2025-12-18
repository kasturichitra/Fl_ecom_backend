

import ProductModel from "../Products/productModel.js";
import ProductReviewModel from "../Products/ProductsReviews/productReviewModel.js";

export const aggregateProductReviewsService = async (tenantDbName) => {
    const [ProductModelDB, ReviewModelDB] = await Promise.all([
        ProductModel(tenantDbName),
        ProductReviewModel(tenantDbName)
    ]);

    const reviewedProducts = await ReviewModelDB.aggregate([
        {
            $match: { status: "published" },
        },
        {
            $group: {
                _id: "$product_unique_id",
            },
        },
    ]);


    for (const { _id: product_unique_id } of reviewedProducts) {
        const product = await ProductModelDB.findOne(
            { product_unique_id },
            { rating_summary: 1 }
        );

        if (!product) continue;


        const lastAggregatedAt =
            product.rating_summary?.last_review_aggregated_at || new Date(0);


        const newReviews = await ReviewModelDB.aggregate([
            {
                $match: {
                    product_unique_id,
                    status: "published",
                    createdAt: { $gt: lastAggregatedAt },
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalRating: { $sum: "$rating" },
                },
            },
        ]);

        if (!newReviews.length) continue;

        const { count: totalNewReviews, totalRating: totalNewRatingSum } = newReviews[0];

        const prevTotal = product.rating_summary?.total_reviews || 0;
        const prevAvg = product.rating_summary?.average_rating || 0;

        const updatedTotal = prevTotal + totalNewReviews;
        const updatedAvg =
            (prevAvg * prevTotal + totalNewRatingSum) / updatedTotal;

        await ProductModelDB.updateOne(
            { product_unique_id },
            {
                $set: {
                    "rating_summary.average_rating": Number(updatedAvg.toFixed(2)),
                    "rating_summary.total_reviews": updatedTotal,
                    "rating_summary.last_review_aggregated_at": new Date(),
                },
            }
        )
    }
};
