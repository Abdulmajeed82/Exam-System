/** @type {import('next').NextConfig} */

// Suppress baseline/browserlist old-data warnings as early as possible
// so messages emitted during pre-compilation are suppressed.
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = 'true'
process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true'

const nextConfig = {
  output: 'standalone',
  // Experimental packages handled by Next. Removed native SQLite dependency after migrating to MongoDB.
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig