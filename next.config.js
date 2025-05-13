/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // si tu as besoin de variables d'env côté client :
    env: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
  }
  
  module.exports = nextConfig
