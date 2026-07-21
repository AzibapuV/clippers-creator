/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
