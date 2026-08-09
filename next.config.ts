import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the two case studies were renamed after they went live; keep the old
  // /work URLs pointing at the new slugs
  async redirects() {
    return [
      { source: "/work/shopos", destination: "/work/brand-memory", permanent: true },
      {
        source: "/work/sketchmonk",
        destination: "/work/generative-video",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
