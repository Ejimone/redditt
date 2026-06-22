import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Folder that contains this config (the Next app root). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const strapiUrl =
  process.env.STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:1337";

function strapiUploadRemotePattern():
  | {
      protocol: "http" | "https";
      hostname: string;
      port?: string;
      pathname: string;
    }
  | undefined {
  try {
    const u = new URL(strapiUrl);
    const protocol = u.protocol === "https:" ? "https" : "http";
    const pattern: {
      protocol: "http" | "https";
      hostname: string;
      port?: string;
      pathname: string;
    } = {
      protocol,
      hostname: u.hostname,
      pathname: "/uploads/**",
    };
    if (u.port) {
      pattern.port = u.port;
    }
    return pattern;
  } catch {
    return undefined;
  }
}

const strapiUploadPattern = strapiUploadRemotePattern();

const nextConfig: NextConfig = {
  // Parent dirs (e.g. home) may contain another package-lock.json; without this,
  // Next can infer the wrong root and break CSS / static asset paths in dev or deploy.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Strapi runs on localhost in dev; Next.js blocks image optimization
    // fetches to private IPs by default to prevent SSRF.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/uploads/**",
      },
      ...(strapiUploadPattern ? [strapiUploadPattern] : []),
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
