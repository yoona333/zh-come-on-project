/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: 'http://localhost:3001'
  },
  // 添加图片域名白名单，如果需要从外部加载图片
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
