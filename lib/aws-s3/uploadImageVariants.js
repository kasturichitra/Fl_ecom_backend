import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import s3 from "./s3.js";

const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Uploads image in original, medium and low quality
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} basePath
 */
export const uploadImageVariants = async ({ fileBuffer, basePath }) => {
  const imageId = uuidv4();

  console.log("File buffer coming in:", fileBuffer);
  const low = await sharp(fileBuffer).resize(300).jpeg({ quality: 40 }).toBuffer();

  const medium = await sharp(fileBuffer).resize(700).jpeg({ quality: 70 }).toBuffer();

  const original = await sharp(fileBuffer).jpeg({ quality: 90 }).toBuffer();

  const uploads = [
    { key: `${basePath}/low-${imageId}.jpg`, body: low },
    { key: `${basePath}/medium-${imageId}.jpg`, body: medium },
    { key: `${basePath}/original-${imageId}.jpg`, body: original },
  ];

  await Promise.all(
    uploads.map(({ key, body }) =>
      s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: "image/jpeg", // ✅ correct
        })
      )
    )
  );

  return {
    low: `https://${bucketName}.s3.amazonaws.com/${uploads[0].key}`,
    medium: `https://${bucketName}.s3.amazonaws.com/${uploads[1].key}`,
    original: `https://${bucketName}.s3.amazonaws.com/${uploads[2].key}`,
  };
};
