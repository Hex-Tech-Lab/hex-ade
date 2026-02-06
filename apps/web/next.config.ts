import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:8888/api/:path*' 
          : 'https://hex-ade-api.onrender.com/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:8888/ws/:path*'
          : 'https://hex-ade-api.onrender.com/ws/:path*',
      }
    ];
  },
};

export default nextConfig;