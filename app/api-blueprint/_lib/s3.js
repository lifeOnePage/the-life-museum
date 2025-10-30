import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

export const R2_BUCKET = process.env.R2_BUCKET_NAME;
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export function randomKey(prefix = "") {
  const id = crypto.randomBytes(8).toString("hex");
  return prefix ? `${prefix}/${Date.now()}-${id}` : `${Date.now()}-${id}`;
}

export function publicUrlForKey(key) {
  // CDN/퍼블릭 버킷 도메인으로 서빙
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return `${base}/${key}`;
}

