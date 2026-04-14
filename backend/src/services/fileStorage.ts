import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import crypto from "crypto";

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  // Ensure path style is used if using non-AWS endpoints like R2 or localstack
  forcePathStyle: !env.S3_ENDPOINT.includes("amazonaws.com"), 
});

export const uploadFile = async (
  buffer: Buffer, 
  mimetype: string, 
  originalName: string, 
  userId: string
): Promise<{ key: string }> => {
  const fileExtension = originalName.split(".").pop();
  const fileHash = crypto.randomBytes(16).toString("hex");
  const key = `users/${userId}/documents/${fileHash}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);
  return { key };
};

export const getFileUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  // Presign URL valid for 1 hour
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const deleteFile = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};
