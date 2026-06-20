/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude native modules dari webpack bundling
  // Required karena @libsql/client adalah native module (Rust binary)
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
