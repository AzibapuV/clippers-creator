/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["ffprobe-static"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
