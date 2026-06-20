/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Exclude native modules dari webpack bundling
    // Required karena @libsql/client adalah native module (Rust binary)
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  },
};

export default nextConfig;
