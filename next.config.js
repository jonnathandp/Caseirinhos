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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'caseirinhos-secret-key'
  }
}

module.exports = nextConfig