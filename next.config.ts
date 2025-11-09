import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cvvpsfifypfpaaofbmlk.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cvvpsfifypfpaaofbmlk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
