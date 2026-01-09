import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import s3 from "./s3.js";

const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Uploads documents (PDF, DOCX) to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} basePath
 * @param {string} originalName
 */
export const uploadDocuments = async ({ fileBuffer, basePath, originalName }) => {
    const fileId = uuidv4();
    const ext = originalName.split('.').pop();
    const key = `${basePath}/${fileId}.${ext}`;

    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        })
    );

    return `https://${bucketName}.s3.amazonaws.com/${key}`;
};
