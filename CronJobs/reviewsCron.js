import ProductModel from "../Products/productModel.js";
import ProductReviewModel from "../Products/ProductsReviews/productReviewModel.js";

export const aggregateProductReviewsService = async (tenantDbName) => {
    console.log(`aggregateProductReviewsService started for ${tenantDbName}`);

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

    console.log(reviewedProducts, "aggregateProductReviewsService reviewedProducts");
    console.log(`Found ${reviewedProducts.length} reviewed products`);

    for (const { _id: product_unique_id } of reviewedProducts) {
        const product = await ProductModelDB.findOne(
            { product_unique_id },
            { rating_summary: 1 }
        );

        if (!product) {
            console.log(`Product NOT found: ${product_unique_id}`);
            continue;
        }

        const lastAggregatedAt =
            product.rating_summary?.last_review_aggregated_at || new Date(0);

        console.log(`Product: ${product_unique_id}, Last Aggregated: ${lastAggregatedAt}`);

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

        console.log(`New reviews found for ${product_unique_id}: ${newReviews.length}`);

        if (!newReviews.length) continue;

        const { count: totalNewReviews, totalRating: totalNewRatingSum } = newReviews[0];

        const prevTotal = product.rating_summary?.total_reviews || 0;
        const prevAvg = product.rating_summary?.average_rating || 0;

        const updatedTotal = prevTotal + totalNewReviews;
        const updatedAvg =
            (prevAvg * prevTotal + totalNewRatingSum) / updatedTotal;

        console.log(
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
        );

        console.log(`Updated ${product_unique_id}`);
    }
};
