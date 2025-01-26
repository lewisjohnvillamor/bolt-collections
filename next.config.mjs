/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'mybatteryplus.com.au',
      'via.placeholder.com',
      'cdn.shopify.com',
      'maranello-theme.myshopify.com'
    ],
  },
  swcMinify: false
};

export default nextConfig;