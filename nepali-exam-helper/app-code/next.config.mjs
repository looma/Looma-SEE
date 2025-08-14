import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Enable any experimental features you need
  },
  webpack: (config) => {
    // Handle path aliases for both src and root structures
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '.')
      ],
      '@/components': [
        path.resolve(__dirname, 'src/components'),
        path.resolve(__dirname, 'components')
      ],
      '@/lib': [
        path.resolve(__dirname, 'src/lib'),
        path.resolve(__dirname, 'lib')
      ],
      '@/app': [
        path.resolve(__dirname, 'src/app'),
        path.resolve(__dirname, 'app')
      ],
      '@/hooks': [
        path.resolve(__dirname, 'src/hooks'),
        path.resolve(__dirname, 'hooks')
      ],
      '@/types': [
        path.resolve(__dirname, 'src/types'),
        path.resolve(__dirname, 'types')
      ],
      '@/utils': [
        path.resolve(__dirname, 'src/utils'),
        path.resolve(__dirname, 'utils')
      ],
      '@/styles': [
        path.resolve(__dirname, 'src/styles'),
        path.resolve(__dirname, 'styles')
      ],
      '@/public': path.resolve(__dirname, 'public')
    }
    return config
  }
}

export default nextConfig
