/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["fluent-ffmpeg", "@ffprobe-installer/ffprobe"],
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
