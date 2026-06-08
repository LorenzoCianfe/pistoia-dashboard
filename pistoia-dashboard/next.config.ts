import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native modules used only on the server must be externalized so the bundler
  // doesn't try to process their .node binaries.
  serverExternalPackages: [
    "@node-rs/argon2",
    "@prisma/client",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
  ],
  experimental: {
    // Keep server action payloads small; we only pass tiny form data.
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
