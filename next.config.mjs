/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Employee documents (contracts, IDs) are uploaded through server actions; files are capped at 4 MB.
    serverActions: { bodySizeLimit: "4.5mb" }
  },
  async headers() {
    return [
      {
        source: "/:path*.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }
        ]
      },
      {
        source: "/:path*.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }
        ]
      }
    ];
  }
};

export default nextConfig;
