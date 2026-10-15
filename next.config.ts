import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client Suggestions was renamed Content Management; keep old links working.
  async redirects() {
    return [
      { source: "/client-suggestions", destination: "/content-management", permanent: true },
    ];
  },
};

export default nextConfig;
