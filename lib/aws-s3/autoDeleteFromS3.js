import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.js";

/**
 * Deletes an object from S3 using its full URL
 * @param {string} fileUrl - Full S3 URL
 */
export const autoDeleteFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    const bucketName = process.env.AWS_S3_BUCKET;

    // Extract key from URL
    // https://bucket.s3.amazonaws.com/folder/file.jpg
    const key = decodeURIComponent(
      new URL(fileUrl).pathname.substring(1)
    );

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3.send(command);
    console.log("🗑️ Deleted from S3:", key);
  } catch (error) {
    console.error("❌ S3 delete failed:", error);
    throw error;
  }
};
