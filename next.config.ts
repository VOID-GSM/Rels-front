import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
