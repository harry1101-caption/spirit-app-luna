import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Se duyên tạm dừng: giữ code, chuyển mọi link cũ về trang chủ (tạm thời, không 308)
  async redirects() {
    return [
      { source: "/duyen", destination: "/", permanent: false },
      { source: "/duyen/:path*", destination: "/", permanent: false },
      // Trắc nghiệm tính cách tạm ẩn
      { source: "/tinh-cach", destination: "/", permanent: false },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
