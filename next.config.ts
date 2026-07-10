/** @type {import('next').NextConfig} */
// Main configuration file for Next.js, including image domains and experimental features
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Silence Prisma + bcrypt edge runtime warnings
  serverExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
};

export default nextConfig;
