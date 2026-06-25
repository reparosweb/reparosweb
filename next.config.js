/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "xygppudatdiliyikzcem.supabase.co" },
    ],
  },
};
module.exports = nextConfig;
