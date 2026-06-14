import "server-only";

import { v2 as cloudinary } from "cloudinary";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

let configured = false;

function ensureConfig() {
  if (configured) {
    return;
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
  configured = true;
}

export function isVideoFile(file: File): boolean {
  const type = file.type?.toLowerCase() ?? "";
  if (type.startsWith("video/")) {
    return true;
  }
  const name = file.name?.toLowerCase() ?? "";
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(name);
}

export async function uploadVideoToCloudinary(file: File): Promise<string> {
  ensureConfig();
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must be 100MB or smaller.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "reddit-clone/posts",
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        const url = result?.secure_url;
        if (!url) {
          reject(new Error("Cloudinary did not return a video URL."));
          return;
        }
        resolve(url);
      },
    );
    stream.end(buffer);
  });
}
