/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'unsplash.com',
      'via.placeholder.com'
    ]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://caseirinhos.up.railway.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL
  },
  // Evitar problemas de renderização estática durante build
  output: 'standalone'
}

module.exports = nextConfig