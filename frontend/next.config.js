/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ตั้งค่าให้รองรับการทำงานใน Docker ได้ดีขึ้น (Optional)
  output: 'standalone',
};

module.exports = nextConfig;