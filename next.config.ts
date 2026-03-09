import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.baito-review.com" }],
        destination: "https://baito-review.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
